'use client';

import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { ME_QUERY, requestGql } from 'src/auth/context/login/queries';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        await setSession(accessToken);

        const data = await requestGql('Customer:me', ME_QUERY, null);
        const c = data?.customer;

        if (c) {
          const firstName = c.firstname ?? '';
          const lastName = c.lastname ?? '';
          const displayName = [firstName, lastName].filter(Boolean).join(' ') || c.email;

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

          setState({
            user: {
              id: c.id ?? null,
              email: c.email,
              firstName,
              lastName,
              displayName,
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
                    region: {
                      name: regionName,
                      code: regionCode,
                      id: regionId,
                    },
                    street,
                    streetLines,
                    suffix: primaryAddress.suffix ?? null,
                  }
                : null,
              identificationType,
              identificationTypeValue,
              identificationNumber,
              accessToken,
            },
            loading: false,
          });
        } else {
          setState({ user: null, loading: false });
        }
      } else {
        setState({ user: null, loading: false });
      }
    } catch (error) {
      console.error('checkUserSession error:', error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const status = state.loading ? 'loading' : state.user ? 'authenticated' : 'unauthenticated';

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
