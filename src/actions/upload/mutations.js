export const VALIDATE_CREDENTIALS_MUTATION = `
mutation ValidateCredentials($user: String!, $password: String!) {
  validateCredentials(input: { user: $user, password: $password }) {
    valid
    message
    expiration_date
  }
}
`;

export const IMPORT_WAREHOUSE_MUTATION = `
mutation ImportWarehouse($input: WarehouseInput!) {
  importWarehouse(input: $input) {
    creados
    no_creados
    razones {
      name
      error
    }
  }
}
`;

export const SIIGO_IMPORT_PRODUCTS_MUTATION = `
mutation SiigoImport($provider: String!) {
  siigoImport(provider: $provider) {
    creados
    no_creados
    razones {
      sku
      errores
    }
  }
}
`;
