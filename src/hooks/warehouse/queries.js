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
      contact_email
      contact_name
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

export const CREATE_WAREHOUSE_MUTATION = gql`
  mutation CreateWarehouse(
    $address: String!,
    $name: String!,
    $city: String!,
    $contact_email: String!,
    $contact_name: String!
    $contact_phone: String!
  ) {
    createWarehouse(
      input: {
        address: $address,
        name: $name,
        city: $city,
        contact_email: $contact_email,
        contact_name: $contact_name,
        contact_phone: $contact_phone
      }
    ) {
      id
      name
      city
      address
      contact_phone
      contact_email
      contact_name
      status
    }
  }
`;

export const CHANGE_WAREHOUSE_STATUS = gql`
  mutation ChangeWarehouseStatus($id: Int!) {
    changeWarehouseStatus(id: $id) {
      status
    }
  }
`;
