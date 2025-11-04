import { gql } from 'graphql-request';
import { useMutation } from '@tanstack/react-query';

import graphqlClient from 'src/lib/graphqlClient';



const LOGIN_MUTATION = gql`
    mutation GenerateCustomerToken($email: String!, $password: String!){
        generateCustomerToken(
            email:$email,
            password: $password
        ) {
            token
        }
    }
`;

export const useLogin = () => useMutation({
        mutationFn: async ({ email, password }) => {
            const data = await graphqlClient.request(LOGIN_MUTATION, { email, password });
            return data.generateCustomerToken.token;
        },
    });
