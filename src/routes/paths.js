// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  HOME: '/home',
};

// ----------------------------------------------------------------------

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-home/',
  // AUTH
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
    login: `${ROOTS.AUTH}/login`,
  },
  // HOME
  home: {
    root: ROOTS.HOME,
    two: `${ROOTS.HOME}/two`,
    three: `${ROOTS.HOME}/three`,
    user: {
      root: `${ROOTS.HOME}/user`,
      new: `${ROOTS.HOME}/user/new`,
      list: `${ROOTS.HOME}/user/list`,
      cards: `${ROOTS.HOME}/user/cards`,
      profile: `${ROOTS.HOME}/user/profile`,
      account: `${ROOTS.HOME}/user/account`,
      edit: (id) => `${ROOTS.HOME}/user/${id}/edit`,
      demo: { edit: `${ROOTS.HOME}/user/edit` }, // TODO: Corregir al id antes del edit
    },
    product: {
      root: `${ROOTS.HOME}/product`,
      new: `${ROOTS.HOME}/product/new`,
      details: (id) => `${ROOTS.HOME}/product/${id}`,
      edit: (id) => `${ROOTS.HOME}/product/${id}/edit`,
      demo: {
        details: `${ROOTS.HOME}/product/`, // TODO: Corregir al id antes del edit
        edit: `${ROOTS.HOME}/product/edit`, // TODO: Corregir al id antes del edit
      },
    },
  },
};
