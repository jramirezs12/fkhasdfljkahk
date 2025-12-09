'use client';

import { gql } from 'graphql-request';

export const REGISTER_MUTATION = gql`
    mutation CreateCustomer(
        $email: String!,
        $firstname: String!, 
        $lastname,: String!,
        $otpCode: String!,
        $otpProcess: OtpProcessEnum!, 
        $password: String!,
        $phoneNumber: String!,
        $roleId: Int!,
        $type: OtpTypeEnum!,
    ){
        CreateCustomerWithOtp(
            input: {
                email: $email, 
                firstname: $firstname, 
                lastname: $lastname, 
                otpCode: $otpCode, 
                otpProcess: $otpProcess, 
                password: $password, 
                phoneNumber: $phoneNumber, 
                roleId: $roleId, 
                type: $type, 
            }
        ){
            success
            message
        }
    }
`;