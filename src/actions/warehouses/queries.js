'use client';

import { gql } from 'graphql-request';

export const GET_WAREHOUSES_QUERY = gql`
    query{
        getWarehouses {
            id
            name
            contact_phone
            city
            address
        }
    }
`;
