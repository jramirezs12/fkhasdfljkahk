'use client';

import { useMemo } from 'react';
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import { iconButtonClasses } from '@mui/material/IconButton';

import { usePathname } from 'src/routes/hooks';

import { _notifications } from 'src/_mock';

import { Logo } from 'src/components/logo';
import { useSettingsContext } from 'src/components/settings';

// Usuario real desde AuthProvider
import { useAuthContext } from 'src/auth/hooks';
import { RoleBasedGuard } from 'src/auth/guard/role-based-guard';

import { NavMobile } from './nav-mobile';
import { VerticalDivider } from './content';
import { NavVertical } from './nav-vertical';
import { NavHorizontal } from './nav-horizontal';
import { _account } from '../nav-config-account';
import { MenuButton } from '../components/menu-button';
import { navData as homeNavData } from '../nav-config-home';
import { AccountDrawer } from '../components/account-drawer';
import { homeLayoutVars, homeNavColorVars } from './css-vars';
import { NotificationsDrawer } from '../components/notifications-drawer';
import { MainSection, layoutClasses, HeaderSection, LayoutSection } from '../core';

// ----------------------------------------------------------------------

export function HomeLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }) {
  const theme = useTheme();
  const pathname = usePathname();
  const { user } = useAuthContext();

  const settings = useSettingsContext();

  const navVars = homeNavColorVars(theme, settings.state.navColor, settings.state.navLayout);
  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navData = slotProps?.nav?.data ?? homeNavData;

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';

  const userRole = user?.role ?? user?.dropshipping?.roleCode ?? null;

  // 1) Aplana todos los items del menú (incluye children)
  const allNavItems = useMemo(() => {
    const out = [];
    const collect = (items = []) => {
      items.forEach((it) => {
        out.push(it);
        if (Array.isArray(it.children) && it.children.length) collect(it.children);
      });
    };
    (navData || []).forEach((section) => collect(section.items || []));
    return out;
  }, [navData]);

  // 2) Busca el item cuyo path coincide exactamente o es prefijo del pathname actual.
  //    Elegimos el de path más largo (match más específico).
  const currentAllowedRoles = useMemo(() => {
    const norm = String(pathname || '').replace(/\/+$/, '');
    const matches = allNavItems.filter((it) => {
      const p = String(it.path || '').replace(/\/+$/, '');
      if (!p) return false;
      if (norm === p) return true;
      return norm.startsWith(p.endsWith('/') ? p : `${p}/`);
    });
    const best = matches.sort((a, b) => (b.path?.length || 0) - (a.path?.length || 0))[0];
    return best?.allowedRoles;
  }, [allNavItems, pathname]);

  // Esta función ya la consumen NavVertical/NavHorizontal/NavMobile para ocultar items
  // Debe devolver true cuando el item debe ocultarse
  const canDisplayItemByRole = (allowedRoles) => {
    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return false; // no ocultar
    return !allowedRoles.includes(userRole); // true => ocultar
  };

  const renderHeader = () => {
    const headerSlotProps = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          cssVars={navVars.section}
          checkPermissions={canDisplayItemByRole}
        />
      ) : null,
      leftArea: (
        <>
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
          />

          {isNavHorizontal && (
            <Logo
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {isNavHorizontal && (
            <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />
          )}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          <NotificationsDrawer data={_notifications} />
          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      onToggleNav={() =>
        settings.setField(
          'navLayout',
          settings.state.navLayout === 'vertical' ? 'mini' : 'vertical'
        )
      }
    />
  );

  const renderMain = () => (
    // Proteger el contenido por rol del item actual
    <RoleBasedGuard hasContent currentRole={userRole} allowedRoles={currentAllowedRoles} sx={{ py: 6 }}>
      <MainSection {...slotProps?.main}>{children}</MainSection>
    </RoleBasedGuard>
  );

  return (
    <LayoutSection
      headerSection={renderHeader()}
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      footerSection={null}
      cssVars={{ ...homeLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}
