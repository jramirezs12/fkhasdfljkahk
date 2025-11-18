'use client';

import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_WAREHOUSES_QUERY } from './queries';

export function useGetWarehouses() {
    return useQuery({
        queryKey: ['graphql:getwarehouses'],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_WAREHOUSES_QUERY);
            return data.getWarehouses || [];
        },
    })
};