'use client';

import { gql } from 'graphql-request';

import graphqlClient from 'src/lib/graphqlClient';

import { setSession } from './utils';

const LOGIN_MUTATION = gql`
  mutation GenerateCustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

export const signInWithPassword = async ({ email, password }) => {
  const data = await graphqlClient.request(LOGIN_MUTATION, { email, password });
  const token = data?.generateCustomerToken?.token;
  if (!token) throw new Error('Token not found in GraphQL response');
  await setSession(token);
  return token;
};

export const signOut = async () => {
  await setSession(null);
};
