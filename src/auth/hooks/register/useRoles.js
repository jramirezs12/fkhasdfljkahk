'use client';

import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { ROLES_QUERY } from 'src/auth/context/register/queries';

export function useRoles() {
    return useQuery({
        queryKey: ['graphql:getroles'],
        queryFn: async () => {
            const data = await graphqlClient.request(ROLES_QUERY);
            return data.dropshippingRoles || [];
        },
    })
};