'use client';

import { gql } from 'graphql-request';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import graphqlClient from 'src/lib/graphqlClient';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';

// Query GraphQL para obtener el usuario actual (customer)
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

          setState({
            user: {
              id: c.id ?? null,
              email: c.email,
              firstName,
              lastName,
              displayName,
              // agrega campos extra que necesites del customer:
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
