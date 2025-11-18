'use client';

import graphqlClient from './graphqlClient';

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
    console.error('[GQL:error]', name, {
      message: String(err?.message || err),
      response: err?.response,
    });

    const errorMessage = err?.response?.errors?.[0]?.message || err.message || 'Error desconocido';
    throw new Error(errorMessage);
  }
}
