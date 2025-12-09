import { useQuery } from "@tanstack/react-query";

import graphqlClient from 'src/lib/graphqlClient';

import { useAuthContext } from 'src/auth/hooks';

import { GET_DROPSHIPPING_ORDERS } from './queries';

export function useDropshippingOrders() {
    const { checkUserSession } = useAuthContext();
    return useQuery({
        queryKey: ["graphql:dropshippingOrders"],
        queryFn: async () => {
            await checkUserSession?.();
            const data = await graphqlClient.request(GET_DROPSHIPPING_ORDERS);
            console.log("Dropshipping Orders Data:", data);
            return data.getDropshippingOrders;
        },
    });
}