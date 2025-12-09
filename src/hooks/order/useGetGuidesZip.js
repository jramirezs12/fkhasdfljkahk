import { useQuery } from "@tanstack/react-query";

import graphqlClient from 'src/lib/graphqlClient';

import { GET_GUIDES_BY_ORDER } from "./queries";

export function useGetGuidesZip(uid) {
    const variables = { order_uid: uid };
    return useQuery({
        queryKey: ["graphql:getGuidesByOrder", uid],
        queryFn: async () => {
            const data = await graphqlClient.request(GET_GUIDES_BY_ORDER, variables);
            return data.getOrderGuides;
        },
        enabled: false,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
    });
}