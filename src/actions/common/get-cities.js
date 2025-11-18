'use client';

import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { GET_CITIES_QUERY } from './queries';

export function useGetCities() {
    return useQuery({
        queryKey: ['graphql:getcities'],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_CITIES_QUERY);
            return data.allCities.items || [];
        },
    })
};