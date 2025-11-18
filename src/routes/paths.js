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
      root: `${ROOTS.HOME}/product`,
    },
    product: {
      root: `${ROOTS.HOME}/product`,
      details: (id) => `${ROOTS.HOME}/product/${id}`,
      create: `${ROOTS.HOME}/product/create`,
      upload: `${ROOTS.HOME}/product/upload`,
      integrations: `${ROOTS.HOME}/product/integrations`,
    },
    warehouse: {
      root: `${ROOTS.HOME}/warehouse`,
    },
    account: {
      root: `${ROOTS.HOME}/account`,
      profile: `${ROOTS.HOME}/account/profile`,
    },
  },
  }
  ;