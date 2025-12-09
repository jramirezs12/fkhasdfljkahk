'use client';

import { gql } from 'graphql-request';

export const ROLES_QUERY = gql`
    query DropshippingRoles {
        dropshippingRoles {
            code
            label
            id
        }
    }
`;