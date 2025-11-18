'use client';

import { gql } from 'graphql-request';

export const GET_CITIES_QUERY = gql`
  query GetAllCities {
    allCities {
      items {
        id
        name
        code
        region {
          id
          name
        }
      }
    }
  }
`;
