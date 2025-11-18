import { CONFIG } from 'src/global-config';

import { AccountGeneralView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Configuración de la cuenta | Inicio - ${CONFIG.appName}`,
};

export default function Page() {
  return <AccountGeneralView />;
}
