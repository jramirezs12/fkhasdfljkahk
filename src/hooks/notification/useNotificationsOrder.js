import { useQuery } from '@tanstack/react-query';

import { GET_ORDERS_NOTIFICATION } from 'src/hooks/order/queries';

import graphqlClient from 'src/lib/graphqlClient';

export function useNotificationsOrder() {
    return useQuery({
        queryKey: ["graphql:getOrdersNotification"],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_ORDERS_NOTIFICATION);
            return data.getDropshippingOrders;
        },
    });
}