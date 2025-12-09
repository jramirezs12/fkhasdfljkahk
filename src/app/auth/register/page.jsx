import { CONFIG } from 'src/global-config';

import RegisterView from 'src/auth/view/register/register-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Registro - ${CONFIG.appName}` };

export default function Page() {
    return <RegisterView />;
}