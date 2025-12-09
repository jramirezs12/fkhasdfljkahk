'use client';

import { useMemo } from 'react';
import { m } from 'framer-motion';

import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { usePathname } from 'src/routes/hooks';
import { getAllowedRolesForPath } from 'src/routes/paths';

import { ForbiddenIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

export function RoleBasedGuard({ sx, children, hasContent = true, currentRole, allowedRoles: allowedRolesProp }) {
  const { user } = useAuthContext() ?? {};
  const pathname = usePathname();

  const userRole = useMemo(() => {
    if (currentRole) return String(currentRole).toLowerCase();
    const drops = user?.dropshipping_user ?? user?.dropshipping ?? null;
    const roleFromDrops =
      drops?.role_code ?? drops?.roleCode ?? drops?.role_id ?? drops?.roleId ?? null;
    const baseRole = user?.role ?? roleFromDrops ?? null;
    return baseRole ? String(baseRole).toLowerCase() : null;
  }, [user, currentRole]);

  const allowedRoles = useMemo(() => {
    if (Array.isArray(allowedRolesProp) && allowedRolesProp.length) {
      return allowedRolesProp.map((r) => String(r).toLowerCase());
    }
    // try route-based rules (getAllowedRolesForPath returns e.g. ['dropper','provider'] or undefined)
    const routeRoles = getAllowedRolesForPath(pathname);
    if (Array.isArray(routeRoles) && routeRoles.length) {
      return routeRoles.map((r) => String(r).toLowerCase());
    }
    return undefined;
  }, [allowedRolesProp, pathname]);

  if (userRole && Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    if (!hasContent) return null;
    return (
      <Container
        component={MotionContainer}
        sx={[{ textAlign: 'center' }, ...(Array.isArray(sx) ? sx : [sx])]}
      >
        <m.div variants={varBounce('in')}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Permiso denegado
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <Typography sx={{ color: 'text.secondary' }}>
            No tienes permiso para acceder a esta página.
          </Typography>
        </m.div>

        <m.div variants={varBounce('in')}>
          <ForbiddenIllustration sx={{ my: { xs: 5, sm: 10 } }} />
        </m.div>
      </Container>
    );
  }

  return <>{children}</>;
}

export default RoleBasedGuard;
