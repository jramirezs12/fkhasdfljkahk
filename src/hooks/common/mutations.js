'use client';

import { gql } from 'graphql-request';

export const CREATE_OTP_REGISTER_MUTATION = gql`
    mutation(
        $type: OtpTypeEnum!,
        $phone: String!,
        $otpProcess: OtpProcessEnum!
    ){
        CreateOtpCode(
            input: {
            type: $type, 
            otpProcess: $otpProcess,
            phoneNumber: $phone, 
            }
        ) {
            success
            expiration
            otp_test
            message
        }
    }
`;