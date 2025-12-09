import { useQuery } from "@tanstack/react-query";

import graphqlClient from 'src/lib/graphqlClient';

import { useAuthContext } from 'src/auth/hooks';

import { GET_WAREHOUSES } from './queries';

export function useGetWarehouses() {
    const { checkUserSession } = useAuthContext();
    return useQuery({
        queryKey: ["graphql:warehouses"],
        queryFn: async () => {
            await checkUserSession?.();
            const data = await graphqlClient.request(GET_WAREHOUSES);
            console.log("Warehouses Data:", data);
            return data.getWarehouses;
        },
    });
}