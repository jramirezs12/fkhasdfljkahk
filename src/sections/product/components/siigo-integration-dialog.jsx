'use client';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';

import {
  importSiigoProducts,
  importSiigoWarehouses,
  validateSiigoCredentials,
} from 'src/actions/upload/integrations';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

const STEPS = {
  CREDENTIALS: 'credentials',
  ACTIONS: 'actions',
  RESULT: 'result',
};

export default function SiigoIntegrationDialog({ open, onClose }) {
  const [step, setStep] = useState(STEPS.CREDENTIALS);

  // Credenciales
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [validation, setValidation] = useState(null);
  const [validating, setValidating] = useState(false);
  const [errorValidate, setErrorValidate] = useState(null);

  // Acciones import
  const [loadingWarehouse, setLoadingWarehouse] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Resultados
  const [warehouseResult, setWarehouseResult] = useState(null);
  const [productsResult, setProductsResult] = useState(null);

  // Form de importWarehouse
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    address: '',
    city: '',
    contact_email: '',
    contact_name: '',
    contact_phone: '',
  });

  const resetAll = () => {
    setStep(STEPS.CREDENTIALS);
    setUser('');
    setPassword('');
    setValidation(null);
    setErrorValidate(null);
    setWarehouseResult(null);
    setProductsResult(null);
    setWarehouseForm({
      name: '',
      address: '',
      city: '',
      contact_email: '',
      contact_name: '',
      contact_phone: '',
    });
  };

  const handleClose = () => {
    resetAll();
    onClose?.();
  };

  async function handleValidate() {
    setValidating(true);
    setErrorValidate(null);
    const resp = await validateSiigoCredentials({ user: user.trim(), password: password.trim() });
    setValidating(false);
    if (!resp.ok) {
      setErrorValidate(resp.error);
      toast.error(resp.error);
      return;
    }
    setValidation(resp.data);
    if (resp.data.valid) {
      toast.success('Credenciales válidas');
      setStep(STEPS.ACTIONS);
    } else {
      setErrorValidate(resp.data.message || 'Credenciales inválidas');
      toast.error(resp.data.message || 'Credenciales inválidas');
    }
  }

  // Dentro de handleImportWarehouses reemplaza la llamada actual:

async function handleImportWarehouses() {
  setLoadingWarehouse(true);
  setWarehouseResult(null);
  const resp = await importSiigoWarehouses({ input: { ...warehouseForm } });
  setLoadingWarehouse(false);
  if (!resp.ok) {
    console.error('WAREHOUSE IMPORT ERROR RAW:', resp.raw);
    toast.error(resp.error);
    return;
  }
  if (resp.fallbackUsed) {
    toast.info('Se usó mutation sin argumento (fallback). Revisa schema.');
  }
  setWarehouseResult(resp.data);
  toast.success(`Importación bodegas: creados ${resp.data.creados}, no creados ${resp.data.no_creados}`);
}

  async function handleImportProducts() {
    setLoadingProducts(true);
    setProductsResult(null);
    const resp = await importSiigoProducts({ provider: 'Siigo' });
    setLoadingProducts(false);
    if (!resp.ok) {
      toast.error(resp.error);
      return;
    }
    setProductsResult(resp.data);
    toast.success(`Importación productos: creados ${resp.data.creados}, no creados ${resp.data.no_creados}`);
  }

  const renderCredentialsStep = () => (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle2">Conectar con Siigo</Typography>
      <TextField
        label="Usuario Siigo"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        size="small"
        autoComplete="off"
      />
      <TextField
        label="Password / Token"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        size="small"
        type="password"
        autoComplete="off"
      />

      {!!errorValidate && (
        <Alert severity="error" variant="outlined">
          {errorValidate}
        </Alert>
      )}

      {!!validation && validation.valid && (
        <Alert severity="success" variant="outlined">
          Credenciales válidas. Expiran: {validation.expiration_date || '—'}
        </Alert>
      )}
    </Box>
  );

  const renderActionsStep = () => (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Importar Bodegas
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          }}
        >
          <TextField
            label="Nombre (opcional)"
            value={warehouseForm.name}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, name: e.target.value }))}
            size="small"
          />
          <TextField
            label="Dirección"
            value={warehouseForm.address}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, address: e.target.value }))}
            size="small"
          />
          <TextField
            label="Ciudad"
            value={warehouseForm.city}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, city: e.target.value }))}
            size="small"
          />
          <TextField
            label="Email contacto"
            value={warehouseForm.contact_email}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, contact_email: e.target.value }))}
            size="small"
          />
          <TextField
            label="Nombre contacto"
            value={warehouseForm.contact_name}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, contact_name: e.target.value }))}
            size="small"
          />
          <TextField
            label="Teléfono contacto"
            value={warehouseForm.contact_phone}
            onChange={(e) => setWarehouseForm((f) => ({ ...f, contact_phone: e.target.value }))}
            size="small"
          />
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            disabled={loadingWarehouse}
            onClick={handleImportWarehouses}
            startIcon={
              loadingWarehouse ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:download-bold" />
            }
          >
            {loadingWarehouse ? 'Importando...' : 'Importar bodegas'}
          </Button>
        </Box>

        {warehouseResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Resultado bodegas</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Creados: {warehouseResult.creados} | No creados: {warehouseResult.no_creados}
            </Typography>
            {warehouseResult.razones?.length > 0 && (
              <Box
                sx={{
                  maxHeight: 160,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {warehouseResult.razones.map((r, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {r.name}:
                    </Typography>{' '}
                    <Typography variant="caption" sx={{ color: 'error.main' }}>
                      {r.error}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Divider />

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Importar Productos
        </Typography>
        <Button
          variant="contained"
          size="small"
            disabled={loadingProducts}
            onClick={handleImportProducts}
            startIcon={
              loadingProducts ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="solar:download-bold" />
            }
        >
          {loadingProducts ? 'Importando...' : 'Importar productos'}
        </Button>

        {productsResult && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Resultado productos</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Creados: {productsResult.creados} | No creados: {productsResult.no_creados}
            </Typography>
            {productsResult.razones?.length > 0 && (
              <Box
                sx={{
                  maxHeight: 160,
                  overflow: 'auto',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 1,
                }}
              >
                {productsResult.razones.map((r, i) => (
                  <Box key={i} sx={{ mb: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {r.sku}:
                    </Typography>{' '}
                    {Array.isArray(r.errores) ? (
                      r.errores.map((er, idx) => (
                        <Typography key={idx} variant="caption" sx={{ color: 'error.main', display: 'block' }}>
                          {er}
                        </Typography>
                      ))
                    ) : (
                      <Typography variant="caption" sx={{ color: 'error.main' }}>
                        {String(r.errores)}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Stack>
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        Integración Siigo
        {step === STEPS.ACTIONS && (
          <Tooltip title="Reset">
            <IconButton
              size="small"
              sx={{ ml: 1 }}
              onClick={() => {
                resetAll();
              }}
            >
              <Iconify icon="solar:refresh-bold" />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>

      <DialogContent dividers>
        {step === STEPS.CREDENTIALS && renderCredentialsStep()}
        {step === STEPS.ACTIONS && renderActionsStep()}
      </DialogContent>

      <DialogActions>
        <Button variant="outlined" size="small" onClick={handleClose}>
          Cerrar
        </Button>

        {step === STEPS.CREDENTIALS && (
          <Button
            variant="contained"
            size="small"
            disabled={!user || !password || validating}
            onClick={handleValidate}
            startIcon={validating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {validating ? 'Validando...' : 'Validar'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
