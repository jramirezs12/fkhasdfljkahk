import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

export function AuthSplitSection({
  sx,
  method,
  methods,
  layoutQuery = 'md',
  title = 'Manage the job',
  // imgUrl used for the illustration (can keep it if necesitas una ilustración separada)
  imgUrl = `${CONFIG.assetsDir}/assets/illustrations/login-intro.png`,
  // backgroundImage used for the section background (pure image, no overlay)
  backgroundImage = `${CONFIG.assetsDir}/assets/background/background-intro.jpg`,
  subtitle = 'More effectively with optimized workflows.',
  ...other
}) {
  return (
    <Box
      sx={[
        (theme) => ({
          px: 3,
          pb: 3,
          width: 1,
          maxWidth: 480,
          display: 'none',
          position: 'relative', // required para que la imagen absolute se posicione sobre este contenedor
          overflow: 'hidden',
          pt: 'var(--layout-header-desktop-height)',
          [theme.breakpoints.up(layoutQuery)]: {
            gap: 8,
            display: 'flex',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      {/* Imagen absolutamente posicionada que se sobrepone sobre todo el contenedor */}
      <Box
        component="img"
        src={backgroundImage}
        alt=""
        sx={{
          position: 'absolute',
          inset: 0, // top:0, right:0, bottom:0, left:0
          width: '100%',
          height: '100%',
          // Sin objectFit ni aspectRatio para que la imagen se muestre "tal cual".
          // 'fill' estira la imagen para cubrir el contenedor; si quieres que no se distorsione
          //, cámbialo a 'cover' o 'contain'. Pediste sin aspect ratio, así que usamos 'fill'.
          objectFit: 'fill',
          objectPosition: 'center',
          zIndex: 1,
          pointerEvents: 'none', // que no interfiera con interacciones
        }}
      />

      {/* Contenido por encima de la imagen */}
      <Box sx={{ position: 'relative', zIndex: 2, width: 1 }}>
        <div>
          <Typography variant="h3" sx={{ textAlign: 'center' }}>
            {title}
          </Typography>

          {subtitle && (
            <Typography sx={{ color: 'text.secondary', textAlign: 'center', mt: 2 }}>
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Si quieres mantener la ilustración separada (opcional) */}
        <Box
          component="img"
          alt="Dashboard illustration"
          src={imgUrl}
          sx={{ width: 1, objectFit: 'cover', position: 'relative' }}
        />
        {/* <Box
          component="img"
          src={imgUrl}
          alt=""
          sx={{
            position: 'absolute',
            left: 32,
            bottom: 120,
            width: '70%', // ajusta tamaño/posición si quieres la foto recortada como en la referencia
            maxWidth: 420,
            pointerEvents: 'none',
          }}
        /> */}

        {!!methods?.length && method && (
          <Box component="ul" sx={{ gap: 2, display: 'flex' }}>
            {methods.map((option) => {
              const selected = method === option.label.toLowerCase();

              return (
                <Box
                  key={option.label}
                  component="li"
                  sx={{
                    ...(!selected && {
                      cursor: 'not-allowed',
                      filter: 'grayscale(1)',
                    }),
                  }}
                >
                  <Tooltip title={option.label} placement="top">
                    <Link
                      component={RouterLink}
                      href={option.path}
                      sx={{ ...(!selected && { pointerEvents: 'none' }) }}
                    >
                      <Box
                        component="img"
                        alt={option.label}
                        src={option.icon}
                        sx={{ width: 32, height: 32 }}
                      />
                    </Link>
                  </Tooltip>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>
    </Box>
  );
}
