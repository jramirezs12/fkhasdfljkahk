'use client';

import { gql } from 'graphql-request';

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
      name
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