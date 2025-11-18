'use client';

import { gql } from 'graphql-request';

export const GET_CATEGORIES_QUERY = gql`
    query{
        categories {
            items {
                uid
                children {
                    product_count
                    uid
                    id
                    name
                }
            }
        }
    }
`;