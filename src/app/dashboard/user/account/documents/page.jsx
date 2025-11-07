import { CONFIG } from 'src/global-config';

import { AccountDocumentsView } from 'src/sections/account/view';

// ----------------------------------------------------------------------

export const metadata = {
  title: `Account documents settings | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <AccountDocumentsView />;
}
