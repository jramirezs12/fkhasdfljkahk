'use client';

import { gql } from 'graphql-request';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import graphqlClient from 'src/lib/graphqlClient';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

const ME_QUERY = gql`
  query Customer {
    customer {
      id
      email
      firstname
      lastname
      allow_remote_shopping_assistance
      confirmation_status
      created_at
      date_of_birth
      default_billing
      default_shipping
      dob
      gender
      group_id
      is_subscribed
      middlename
      prefix
      suffix
      taxvat
      addresses {
        default_shipping
        country_code
        country_id
        city
        postcode
        telephone
        company
        firstname
        lastname
        region {
          region
          region_code
          region_id
        }
        street
        suffix
      }
      custom_attributes(attributeCodes: ["tipo_identificacion_usuario", "numero_identificacion_usuario"]) {
        code
        ... on AttributeValue {
          value
        }
        ... on AttributeSelectedOptions {
          selected_options {
            value
            label
          }
        }
      }
    }
  }
`;

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

  const checkUserSession = useCallback(async () => {
    try {
      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);

      if (accessToken && isValidToken(accessToken)) {
        await setSession(accessToken);

        const data = await graphqlClient.request(ME_QUERY);
        const c = data?.customer;

        if (c) {
          const firstName = c.firstname ?? '';
          const lastName = c.lastname ?? '';
          const displayName = [firstName, lastName].filter(Boolean).join(' ') || c.email;

          // Dirección principal
          const addresses = Array.isArray(c.addresses) ? c.addresses : [];
          const primaryAddress =
            addresses.find((a) => a?.default_shipping) ?? addresses[0] ?? null;

          const streetLines = Array.isArray(primaryAddress?.street)
            ? primaryAddress.street.filter(Boolean)
            : [];
          const street = streetLines.join(', ');

          const regionObj = primaryAddress?.region ?? {};
          const regionName = regionObj?.region ?? null;
          const regionCode = regionObj?.region_code ?? null;
          const regionId = regionObj?.region_id ?? null;

          // Custom attributes
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
              // Campos extra del customer
              allowRemoteShoppingAssistance: c.allow_remote_shopping_assistance,
              confirmationStatus: c.confirmation_status,
              createdAt: c.created_at,
              defaultBilling: c.default_billing,
              defaultShipping: c.default_shipping,
              gender: c.gender,
              groupId: c.group_id,
              isSubscribed: c.is_subscribed,
              middlename: c.middlename,
              prefix: c.prefix,
              suffix: c.suffix,
              taxvat: c.taxvat,
              // Dirección principal (si aplica)
              address: primaryAddress
                ? {
                    defaultShipping: !!primaryAddress.default_shipping,
                    countryCode: primaryAddress.country_code ?? null, // "CO"
                    countryId: primaryAddress.country_id ?? null, // "CO"
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
                    street, // "CL 147 A # 45 - 91, primer piso"
                    streetLines, // ['CL 147 A # 45 - 91', 'primer piso']
                    suffix: primaryAddress.suffix ?? null,
                  }
                : null,
              // Identificación
              identificationType, // "Cédula de ciudadanía"
              identificationTypeValue, // "308"
              identificationNumber, // "6546463546"
              // Token
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

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
