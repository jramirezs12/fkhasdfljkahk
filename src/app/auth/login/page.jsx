import { CONFIG } from 'src/global-config';

import LoginView from 'src/auth/view/login/login-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in - ${CONFIG.appName}` };

export default function Page() {
  return <LoginView />;
}
