import { useQuery } from "@tanstack/react-query";

import graphqlClient from 'src/lib/graphqlClient';

import { GET_ORDER } from './queries';

export function useGetOrder(id) {
    const variables = { order_id: id };
    return useQuery({
        queryKey: ["graphql:getOrder", id],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_ORDER, variables);
            return data.getDropshippingOrders;
        },
    });
}