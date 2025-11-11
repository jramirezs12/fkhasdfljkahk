import { CONFIG } from 'src/global-config';
import { HomeLayout } from 'src/layouts/home';

import { AuthGuard } from 'src/auth/guard';

// ----------------------------------------------------------------------

export default function Layout({ children }) {
  if (CONFIG.auth.skip) {
    return <HomeLayout>{children}</HomeLayout>;
  }

  return (
    <AuthGuard>
      <HomeLayout>{children}</HomeLayout>
    </AuthGuard>
  );
}
