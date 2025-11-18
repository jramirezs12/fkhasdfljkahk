import { CONFIG } from 'src/global-config';

import LoginView from 'src/auth/view/login/login-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Login - ${CONFIG.appName}` };

export default function Page() {
  return <LoginView />;
}
