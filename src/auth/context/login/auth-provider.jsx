'use client';

// Fallback si por alguna razón AuthContext no está disponible en tiempo de ejecución
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback, createContext } from 'react';

import { requestGql } from 'src/lib/graphqlRequest';

import { ME_QUERY } from './queries';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken, getSessionToken, refreshSessionToken } from './utils';

const FallbackAuthContext = createContext(null);
const EffectiveAuthContext = AuthContext || FallbackAuthContext;

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
    needsRole: false,
    forceRoleSelection: false,
  });

  const buildUser = (c) => {
    const addresses = Array.isArray(c.addresses) ? c.addresses : [];
    const primaryAddress = addresses.find((a) => a?.default_shipping) ?? addresses[0] ?? null;

    const streetLines = Array.isArray(primaryAddress?.street)
      ? primaryAddress.street.filter(Boolean)
      : [];
    const street = streetLines.join(', ');

    const regionObj = primaryAddress?.region ?? {};
    const regionName = regionObj?.region ?? null;
    const regionCode = regionObj?.region_code ?? null;
    const regionId = regionObj?.region_id ?? null;

    const custom = Array.isArray(c.custom_attributes) ? c.custom_attributes : [];
    const getCustom = (code) => custom.find((a) => a?.code === code);

    const idTypeOpt = getCustom('tipo_identificacion_usuario')?.selected_options?.[0];
    const identificationType = idTypeOpt?.label ?? null;
    const identificationTypeValue = idTypeOpt?.value ?? null;
    const identificationNumber = getCustom('numero_identificacion_usuario')?.value ?? null;

    const dropship = c?.dropshipping_user ?? null;
    const dropshipRoleCode = dropship?.role_code ?? null;
    const dropshipRoleId = dropship?.role_id ?? null;
    const dropshipStatus = dropship?.status ?? null;
    const dropshipUserId = dropship?.user_id ?? null;

    const role = (dropshipRoleCode || '').toLowerCase() || null;
    const needsRole = !role;

    return {
      user: {
        id: c.id ?? null,
        email: c.email,
        firstName: c.firstname ?? '',
        lastName: c.lastname ?? '',
        displayName: [c.firstname ?? '', c.lastname ?? ''].filter(Boolean).join(' ') || c.email,
        confirmationStatus: c.confirmation_status,
        gender: c.gender,
        middlename: c.middlename,
        address: primaryAddress
          ? {
              defaultShipping: !!primaryAddress.default_shipping,
              countryCode: primaryAddress.country_code ?? null,
              countryId: primaryAddress.country_id ?? null,
              city: primaryAddress.city ?? null,
              postcode: primaryAddress.postcode ?? null,
              telephone: primaryAddress.telephone ?? null,
              company: primaryAddress.company ?? null,
              firstName: primaryAddress.firstname ?? null,
              lastName: primaryAddress.lastname ?? null,
              region: { name: regionName, code: regionCode, id: regionId },
              street,
              streetLines,
              suffix: primaryAddress.suffix ?? null,
            }
          : null,
        identificationType,
        identificationTypeValue,
        identificationNumber,
        dropshipping: dropship
          ? {
              roleCode: dropshipRoleCode,
              roleId: dropshipRoleId,
              status: dropshipStatus,
              userId: dropshipUserId,
            }
          : null,
        role,
      },
      needsRole,
      forceRoleSelection: needsRole,
    };
  };

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = await getSessionToken();

      // If we have a token and it's still valid, just set it and fetch ME.
      if (accessToken && isValidToken(accessToken)) {
        await setSession(accessToken);

        const data = await requestGql('Customer:me', ME_QUERY, null);
        const c = data?.customer;

        if (c) {
          const built = buildUser(c);

          setState({
            user: built.user,
            loading: false,
            needsRole: built.needsRole,
            forceRoleSelection: built.forceRoleSelection,
          });

          return { user: built.user, needsRole: built.needsRole };
        }

        setState({ user: null, loading: false, needsRole: false, forceRoleSelection: false });
        return { user: null, needsRole: false };
      }

      // Token exists but is invalid/expired -> try to refresh using server mutation
      if (accessToken && !isValidToken(accessToken)) {
        try {
          const newToken = await refreshSessionToken();
          if (newToken) {
            // setSession already called inside refreshSessionToken
            const data = await requestGql('Customer:me', ME_QUERY, null);
            const c = data?.customer;
            if (c) {
              const built = buildUser(c);
              setState({
                user: built.user,
                loading: false,
                needsRole: built.needsRole,
                forceRoleSelection: built.forceRoleSelection,
              });
              return { user: built.user, needsRole: built.needsRole };
            }
          }
        } catch (err) {
          console.warn('refreshSessionToken flow failed', err);
        }
      }

      // otherwise, no token or unable to refresh -> unauthenticated
      setState({ user: null, loading: false, needsRole: false, forceRoleSelection: false });
      return { user: null, needsRole: false };
    } catch (error) {
      console.error('checkUserSession error:', error);
      // On error, clear any stale user and mark as unauthenticated (but not loading)
      setState({ user: null, loading: false, needsRole: false, forceRoleSelection: false });
      return { user: null, needsRole: false, error };
    }
  }, [setState]);

  useEffect(() => {
    // On mount, perform session check.
    // Note: checkUserSession is async and will set forceRoleSelection if needed.
    checkUserSession();
  }, [checkUserSession]);

  // Important: if forceRoleSelection is true we don't want the app to treat the user as "authenticated"
  // because that causes route guards / redirects to the app. We expose a special status 'needsRole'.
  const status = state.loading
    ? 'loading'
    : state.forceRoleSelection
    ? 'needsRole'
    : state.user
    ? 'authenticated'
    : 'unauthenticated';

  const memoizedValue = useMemo(
    () => ({
      user: state.user ?? null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      needsRole: state.needsRole,
      forceRoleSelection: state.forceRoleSelection,
      // Utilidad para limpiar user (cuando el login vuelve atrás)
      clearAuthUser: () =>
        setState({
          user: null,
          loading: false,
          needsRole: false,
          forceRoleSelection: false,
        }),
    }),
    [checkUserSession, state.user, state.needsRole, state.forceRoleSelection, status, setState]
  );

  return (
    <EffectiveAuthContext.Provider value={memoizedValue}>
      {children}
    </EffectiveAuthContext.Provider>
  );
}
