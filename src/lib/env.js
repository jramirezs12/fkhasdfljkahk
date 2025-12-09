// Centraliza variables de entorno y construcción de URLs por entorno (JavaScript)

function readEnv(name, fallback) {
  return process.env[name] || fallback || '';
}

function normalizeBase(url) {
  if (!url) return '';
  // remove trailing slash
  return url.replace(/\/+$/, '');
}

export const env = {
  // Base REST: debe incluir /rest/V1 y no terminar con slash extra
  ALCARRITO_REST_BASE_URL: normalizeBase(
    readEnv('ALCARRITO_REST_BASE_URL') ||
      readEnv('NEXT_PUBLIC_ALCARRITO_REST_BASE_URL') ||
      'https://mcstaging.alcarrito.com/rest/V1'
  ),
  // GraphQL endpoint directo
  ALCARRITO_GRAPHQL_URL:
    readEnv('ALCARRITO_GRAPHQL_URL') ||
    readEnv('NEXT_PUBLIC_ALCARRITO_GRAPHQL_URL') ||
    'https://mcstaging.alcarrito.com/graphql',
  // Store code para header en GraphQL (opcional)
  ALCARRITO_STORE_CODE: readEnv('ALCARRITO_STORE_CODE') || readEnv('NEXT_PUBLIC_ALCARRITO_STORE_CODE') || 'dropshipping',
  NODE_ENV: readEnv('NODE_ENV', 'development'),
};

export function restUrl(path) {
  const base = env.ALCARRITO_REST_BASE_URL;
  if (!base) throw new Error('ALCARRITO_REST_BASE_URL is not configured');
  const cleanPath = String(path || '').replace(/^\/+/, '');
  return `${base}/${cleanPath}`;
}

export function graphqlUrl() {
  const url = env.ALCARRITO_GRAPHQL_URL;
  if (!url) throw new Error('ALCARRITO_GRAPHQL_URL is not configured');
  return url;
}
