'use client';

import useSWR from 'swr';

import graphqlClient from 'src/lib/graphqlClient';

import { ME_QUERY } from 'src/auth/context/login/queries';

/**
 * useCurrentUser
 * - centraliza la carga de "me" y la detección de roles.
 * - retorna: me, dropshipping, roleCode, isProvider, isDropper, isLoading, error
 */
export function useCurrentUser() {
  const { data, error, isValidating } = useSWR(
    'me',
    async () => {
      const res = await graphqlClient.request(ME_QUERY);
      return res?.customer ?? null;
    },
    { revalidateOnFocus: false, revalidateOnMount: false }
  );

  const dropshipping = data?.dropshipping_user ?? null;
  const roleCodeRaw = dropshipping?.role_code ?? '';
  const roleCode = typeof roleCodeRaw === 'string' ? roleCodeRaw.toLowerCase() : '';
 

  // heurística: si role_code contiene provider/prov lo consideramos provider
  const isProviderByRole = !!dropshipping && (roleCode.includes('provider') || roleCode.includes('prov'));

  // heurística de dropper (si necesitas)
  const isDropper = !!dropshipping && (roleCode.includes('drop') || roleCode.includes('dropper'));

  return {
    me: data,
    dropshipping,
    roleCode,
    isProviderByRole,
    isDropper,
    isLoading: !data && isValidating,
    error,
  };
}
