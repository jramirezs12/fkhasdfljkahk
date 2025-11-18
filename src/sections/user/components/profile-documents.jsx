'use client';

import { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ProfileDocuments({ onSubmit, sx, ...other }) {
  const cedulaRef = useRef(null);
  const rutRef = useRef(null);
  const certificadoRef = useRef(null);

  const [cedulaFile, setCedulaFile] = useState(null);
  const [rutFile, setRutFile] = useState(null);
  const [certificadoFile, setCertificadoFile] = useState(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState({
    cedula: '',
    rut: '',
    certificado: '',
    terms: '',
    submit: '',
  });

  const ACCEPT = '.pdf';

  const handleChoose = (ref) => () => ref?.current?.click();

  const handleFileChange = (setter, fieldKey) => (e) => {
    const file = e.target.files?.[0] ?? null;
    setter(file);
    setErrors((prev) => ({ ...prev, [fieldKey]: '' }));
  };

  const validate = () => {
    const next = { cedula: '', rut: '', certificado: '', terms: '', submit: '' };

    if (!cedulaFile) next.cedula = 'Este documento es obligatorio.';
    if (!rutFile) next.rut = 'Este documento es obligatorio.';
    if (!certificadoFile) next.certificado = 'Este documento es obligatorio.';
    if (!acceptTerms) next.terms = 'Debes aceptar los términos y condiciones.';

    setErrors(next);
    return !next.cedula && !next.rut && !next.certificado && !next.terms;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const payload = { cedulaFile, rutFile, certificadoFile, acceptTerms };
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Aquí iría tu submit real (FormData + fetch/axios)
        // console.log('Submitting documents payload:', payload);
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        submit: err?.message || 'Ocurrió un error al registrar. Intenta nuevamente.',
      }));
    }
  };

  const renderRow = (label, file, onChoose, fileKey, helperError) => (
    <Box
      sx={{
        gap: 2,
        display: 'grid',
        alignItems: 'center',
        gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
      }}
    >
      <Box>
        <Typography variant="subtitle2">{label}</Typography>
        {!!file && (
          <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
            {file.name}
          </Typography>
        )}
        {!!helperError && (
          <FormHelperText error sx={{ mt: 0.5 }}>
            {helperError}
          </FormHelperText>
        )}
      </Box>

      <Button
        variant="soft"
        color="primary"
        startIcon={<Iconify icon="solar:paperclip-2-bold" />}
        onClick={onChoose}
        sx={{ justifySelf: { xs: 'start', sm: 'end' } }}
      >
        Cargar
      </Button>
    </Box>
  );

  return (
    <Card
      sx={[
        { mt: 3 }, // espacio superior para que no quede pegado
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <CardHeader title="Adjuntar documentos" />

      <Stack spacing={2.5} sx={{ p: 3 }}>
        {renderRow(
          'Cédula del representante*',
          cedulaFile,
          handleChoose(cedulaRef),
          'cedula',
          errors.cedula
        )}
        {renderRow('RUT*', rutFile, handleChoose(rutRef), 'rut', errors.rut)}
        {renderRow(
          'Certificado bancario*',
          certificadoFile,
          handleChoose(certificadoRef),
          'certificado',
          errors.certificado
        )}

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Formato permitidos: PDF
        </Typography>

        <Divider sx={{ my: 1 }} />

        <FormControlLabel
          control={
            <Checkbox
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (e.target.checked) setErrors((p) => ({ ...p, terms: '' }));
              }}
            />
          }
          label={
            <Typography variant="body2">
              Acepto términos y condiciones. Autorizo el tratamiento de mis datos personales para las
              finalidades descritas en la{' '}
              <Link href="/politica-de-datos" target="_blank" rel="noopener" underline="always">
                Política de tratamiento de datos personales de Inter Rapidísimo
              </Link>
              .
            </Typography>
          }
        />
        {!!errors.terms && (
          <FormHelperText error sx={{ mt: -1 }}>
            {errors.terms}
          </FormHelperText>
        )}

        {!!errors.submit && (
          <Typography variant="body2" color="error">
            {errors.submit}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!acceptTerms || !cedulaFile || !rutFile || !certificadoFile}
          >
            Registrarse
          </Button>
        </Box>
      </Stack>

      {/* Inputs ocultos */}
      <input
        ref={cedulaRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileChange(setCedulaFile, 'cedula')}
      />
      <input
        ref={rutRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileChange(setRutFile, 'rut')}
      />
      <input
        ref={certificadoRef}
        type="file"
        accept={ACCEPT}
        style={{ display: 'none' }}
        onChange={handleFileChange(setCertificadoFile, 'certificado')}
      />
    </Card>
  );
}
