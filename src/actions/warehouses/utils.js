'use client';

export function formatGraphqlError(prefix, err) {
  const graphErrors = err?.response?.errors;
  const firstMsg = graphErrors?.[0]?.message || err?.message || 'Error desconocido';
  return {
    ok: false,
    error: `${prefix}: ${firstMsg}`,
    raw: { status: err?.response?.status, errors: graphErrors, request: err?.request },
  };
}
