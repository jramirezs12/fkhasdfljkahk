import { useQuery } from "@tanstack/react-query";

import graphqlClient from 'src/lib/graphqlClient';

import { GET_DROPSHIPPING_ORDERS } from './queries';

export function useDropshippingOrders() {
    return useQuery({
        queryKey: ["graphql:dropshippingOrders"],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_DROPSHIPPING_ORDERS);
            return data.getDropshippingOrders;
        },
    });
}