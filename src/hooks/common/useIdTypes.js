'use client';

import { useQuery } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';

import { ID_TYPES_QUERY } from './queries';

export function useIdTypes() {
    return useQuery({
        queryKey: ['graphql:idtypes'],
        queryFn: async () => {
            const variables = {
                attributeCode: 'tipo_identificacion_usuario', 
                entityType: 'customer',
            };
            const data = await graphqlClient.request(ID_TYPES_QUERY, variables);
            return data.customAttributeMetadataV2.items?.[0]?.options || [];
        },
    })
};