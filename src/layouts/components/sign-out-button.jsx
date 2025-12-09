import { useCallback } from 'react';

import Button from '@mui/material/Button';
//import { paths } from 'src/routes/paths';
//import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/login/action';

// ----------------------------------------------------------------------

export function SignOutButton({ onClose, sx, ...other }) {
  //const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const handleLogout = useCallback(async () => {
    try {
      await signOut();
      await checkUserSession?.();
      onClose?.();
      //router.replace(paths.auth.login);
      //router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [onClose, checkUserSession]);

  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={handleLogout}
      sx={sx}
      {...other}
    >
      Cerrar sesión
    </Button>
  );
}
