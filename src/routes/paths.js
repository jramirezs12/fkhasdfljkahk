// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  HOME: '/home',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-home/',
  product: {
    root: `/product`,
    checkout: `/product/checkout`,
    details: (id) => `/product/${id}`,
  },
  // AUTH
  auth: {
    login: `${ROOTS.AUTH}/login`,
  },
  // HOME
  home: {
    root: ROOTS.HOME,
    user: {
      root: `${ROOTS.HOME}/user`,
      new: `${ROOTS.HOME}/user/new`,
      list: `${ROOTS.HOME}/user/list`,
      cards: `${ROOTS.HOME}/user/cards`,
      profile: `${ROOTS.HOME}/user/profile`,
      account: `${ROOTS.HOME}/user/account`,
      edit: (id) => `${ROOTS.HOME}/user/${id}/edit`,
    },
    store: {
      root: `${ROOTS.HOME}/store`,
    },
    product: {
      root: `${ROOTS.HOME}/product`,
      details: (id) => `${ROOTS.HOME}/product/${id}`,
      create: `${ROOTS.HOME}/product/create`,
      list: `${ROOTS.HOME}/product/list`,
      listDetails: (id) => `${ROOTS.HOME}/product/list/${id}`,
      upload: `${ROOTS.HOME}/product/upload`,
      integrations: `${ROOTS.HOME}/product/integrations`,
    },
    provider: {
      details: (id) => `${ROOTS.HOME}/provider/${id}`
    },
    order: {
      root: `${ROOTS.HOME}/order`,
      details: (id) => `${ROOTS.HOME}/order/${id}`,
    },
    warehouse: {
      root: `${ROOTS.HOME}/warehouse`,
    },
    account: {
      root: `${ROOTS.HOME}/account`,
      profile: `${ROOTS.HOME}/account/profile`,
    },
    banking: {
      root: `${ROOTS.HOME}/banking`,
    },
  },
};

// ----------------------------------------------------------------------
// Reglas de permisos por ruta (patterns)
// - Usa ':param' para parámetros (ej. '/home/product/:id')
// - Soporta wildcard '*' al final para prefijos (ej. '/home/store/*')
// - La función getAllowedRolesForPath devuelve el array de allowedRoles o undefined.
export const ROUTE_PERMISSIONS = [
  // detalle de producto: dropper + provider pueden ver
  { pattern: '/home/product/:id', allowedRoles: ['dropper', 'provider'] },

  // listado y CRUD del módulo de productos -> solo dropper
  { pattern: '/home/product/list',  },
  { pattern: '/home/product/create', },
  { pattern: '/home/product/upload' },
  { pattern: '/home/product/integrations' },

  // si quieres bloquear la raíz /home/product solo para dropper (opcional)
  { pattern: '/home/product', allowedRoles: ['dropper'] },

  // ejemplo: permitir provider y dropper en listDetails
  { pattern: '/home/product/list/:id', allowedRoles: ['dropper', 'provider'] },

  // Puedes añadir más reglas aquí...
];

// ---------- helpers para comparar patrones ----------
function escapeRegex(s = '') {
  return s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
}

function compilePattern(pattern) {
  let p = String(pattern);
  // escape
  p = escapeRegex(p);
  // :param -> ([^/]+)
  p = p.replace(/\\:([a-zA-Z0-9_]+)/g, '([^/]+)');
  // wildcard at end \* -> .*
  if (p.endsWith('\\*')) {
    p = p.slice(0, -2) + '.*';
  }
  const regex = new RegExp(`^${p}$`);
  const score = pattern.length;
  return { regex, score };
}

const _COMPILED = ROUTE_PERMISSIONS.map((r) => ({ ...r, _compiled: compilePattern(r.pattern) }));

// Devuelve allowedRoles si pathname coincide (elige pattern más específico)
export function getAllowedRolesForPath(pathname) {
  if (!pathname) return undefined;
  const norm = String(pathname).replace(/\/+$/, '') || '/';
  const matches = [];

  for (const r of _COMPILED) {
    const { regex } = r._compiled;
    if (regex.test(norm)) {
      matches.push({ allowedRoles: r.allowedRoles, score: r._compiled.score, pattern: r.pattern });
    }
  }

  if (!matches.length) return undefined;
  matches.sort((a, b) => b.score - a.score);
  return matches[0].allowedRoles;
}

// export por defecto paths (opcional)
export default paths;
