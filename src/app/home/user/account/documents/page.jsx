import { CONFIG } from 'src/global-config';

import { AccountDocumentsView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Documentos de la cuenta | Inicio - ${CONFIG.appName}`,
};

export default function Page() {
  return <AccountDocumentsView />;
}
