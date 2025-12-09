import graphqlClient from 'src/lib/graphqlClient';

import { IMPORT_WAREHOUSE_MUTATION, VALIDATE_CREDENTIALS_MUTATION, SIIGO_IMPORT_PRODUCTS_MUTATION } from './mutations';

/**
 * Integrations helpers (GraphQL client)
 * - Keep simple functions that return { ok, data } or { ok: false, error, raw }
 * - graphqlClient is shared; it will go through proxy / headers
 */

export async function validateSiigoCredentials({ user, password }) {
  try {
    const data = await graphqlClient.request(VALIDATE_CREDENTIALS_MUTATION, { user, password });
    return { ok: true, data: data.validateCredentials };
  } catch (err) {
    return formatGraphqlError('Error validando credenciales', err);
  }
}

export async function importSiigoWarehouses({ input }) {
  try {
    const cleanInput = Object.fromEntries(
      Object.entries(input || {}).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );

    const requiredFields = ['address', 'city', 'contact_email', 'contact_name', 'contact_phone'];
    const missing = requiredFields.filter((f) => !cleanInput[f]);
    if (missing.length) {
      return { ok: false, error: `Faltan campos requeridos para WarehouseInput: ${missing.join(', ')}` };
    }

    const data = await graphqlClient.request(IMPORT_WAREHOUSE_MUTATION, { input: cleanInput });
    return { ok: true, data: data.importWarehouse };
  } catch (err) {
    return formatGraphqlError('Error importando bodegas', err);
  }
}

export async function importSiigoProducts({ provider = 'Siigo' } = {}) {
  try {
    const data = await graphqlClient.request(SIIGO_IMPORT_PRODUCTS_MUTATION, { provider });
    return { ok: true, data: data.siigoImport };
  } catch (err) {
    return formatGraphqlError('Error importando productos', err);
  }
}

export async function getSiigoIntegrationHistory() {
  try {
    return {
      ok: true,
      data: [
        {
          id: 'hist_1',
          type: 'warehouses',
          created_at: new Date().toISOString(),
          source: 'Siigo',
          result: { creados: 0, no_creados: 7 },
          errores: ['Warehouse already exists.'],
        },
      ],
    };
  } catch (err) {
    return formatGraphqlError('Error obteniendo historial', err);
  }
}

function formatGraphqlError(prefix, err) {
  const graphErrors = err?.response?.errors;
  const firstMsg = graphErrors?.[0]?.message || err?.message || 'Error desconocido';
  return {
    ok: false,
    error: `${prefix}: ${firstMsg}`,
    raw: { status: err?.response?.status, errors: graphErrors, request: err?.request },
  };
}
