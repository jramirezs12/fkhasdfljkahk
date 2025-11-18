'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as ThemeVarsProvider } from '@mui/material/styles';

import { createTheme } from 'src/theme/create-theme';
import { Rtl } from 'src/theme/with-settings/right-to-left';

import { useSettingsContext } from 'src/components/settings';

// ----------------------------------------------------------------------

export function ThemeProvider({ themeOverrides, children, ...other }) {
  const settings = useSettingsContext();

  const theme = createTheme({
    settingsState: settings.state,
    themeOverrides,
  });

  return (
    <ThemeVarsProvider disableTransitionOnChange theme={theme} {...other}>
      <CssBaseline />
      <Rtl direction={settings.state.direction}>{children}</Rtl>
    </ThemeVarsProvider>
  );
}
