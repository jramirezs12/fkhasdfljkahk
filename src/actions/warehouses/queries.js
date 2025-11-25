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
      status
    }
  }
`;

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

export const GET_WAREHOUSE_BY_ID = gql`
  query GetWarehouseById($id: Int!) {
    getWarehouseById(id: $id) {
      id
      name
      contact_email
      contact_name
      contact_phone
      address
      city
      status
    }
  }
`;