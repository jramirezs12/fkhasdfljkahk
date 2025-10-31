import { gql } from 'graphql-request';
import graphqlClient from '@/lib/graphqlClient';
import { useMutation } from '@tanstack/react-query';



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

export const useLogin = () => {
    return useMutation({
        mutationFn: async ({ email, password }) => {
            const data = await graphqlClient.request(LOGIN_MUTATION, { email, password });
            return data.generateCustomerToken.token;
        },
    });
};
