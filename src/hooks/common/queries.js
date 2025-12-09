'use client';

import { gql } from 'graphql-request';

export const ID_TYPES_QUERY = gql`
    query CustomAttributeMetadataV2($attributeCode: String!, $entityType: String!) {
        customAttributeMetadataV2(
            attributes: [
                {
                attribute_code: $attributeCode
                entity_type: $entityType
                }
            ]
        ) {
            items {
                code
                label
                options {
                    value
                    label
                }
            }
        }
    }
`;