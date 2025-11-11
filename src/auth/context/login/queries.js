'use client';

import { gql } from 'graphql-request';

import graphqlClient from 'src/lib/graphqlClient';

// ---------------------- Auth (email/password) ----------------------
export const LOGIN_MUTATION = gql`
  mutation GenerateCustomerToken($email: String!, $password: String!) {
    generateCustomerToken(email: $email, password: $password) {
      token
    }
  }
`;

// ---------------------- OTP (teléfono) ----------------------
export const VALIDATE_PHONE = gql`
  query validatePhone($phone: String!) {
    OtpUsersByPhone(phoneNumber: $phone) {
      items {
        uid
        email
      }
    }
  }
`;

export const CREATE_OTP = gql`
  mutation CreateOTP($uid: String!, $phone: String!, $type: String!) {
    CreateOtpCode(input: { uid: $uid, phoneNumber: $phone, type: $type }) {
      success
      expiration
    }
  }
`;

export const VALIDATE_OTP = gql`
  mutation ValidateOTP($uid: String!, $code: String!, $type: String!) {
    ValidateOtpCode(input: { uid: $uid, otpCode: $code, type: $type }) {
      isValid
      token
      message
    }
  }
`;

// ---------------------- ME query (customer) ----------------------
export const ME_QUERY = gql`
  query Customer {
    customer {
      id
      email
      firstname
      lastname
      confirmation_status
      date_of_birth
      gender
      middlename
      addresses {
        default_shipping
        country_code
        country_id
        city
        postcode
        telephone
        company
        firstname
        lastname
        region {
          region
          region_code
          region_id
        }
        street
      }
      custom_attributes(
        attributeCodes: ["tipo_identificacion_usuario", "numero_identificacion_usuario"]
      ) {
        code
        ... on AttributeValue {
          value
        }
        ... on AttributeSelectedOptions {
          selected_options {
            value
            label
          }
        }
      }
    }
  }
`;

// ---------------------- Request wrapper con logs ----------------------
export async function requestGql(name, doc, variables) {
  try {
    console.debug('[GQL:request]', name, {
      query: (doc && doc.loc && doc.loc.source && doc.loc.source.body) || '[gql doc]',
      variables,
    });
    const res = await graphqlClient.request(doc, variables);
    console.debug('[GQL:response]', name, res);
    return res;
  } catch (err) {
    console.debug('[GQL:error]', name, {
      message: String(err?.message || err),
      response: err?.response,
    });
    throw err;
  }
}
