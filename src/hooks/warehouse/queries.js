'use client';

import { gql } from 'graphql-request';

export const GET_WAREHOUSES = gql`
  query GetWarehouses {
    getWarehouses {
      id
      name
      contact_phone
      city
      address
    }
  }
`;