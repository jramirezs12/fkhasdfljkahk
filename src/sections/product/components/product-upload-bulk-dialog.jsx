'use client';

import { useRef, useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { uploadProduct } from 'src/actions/upload/uploadProducts';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const CSV_ACCEPTED = ['text/csv', 'application/vnd.ms-excel'];
const CSV_ACCEPT_ATTR = '.csv';
const IMG_ACCEPTED = ['image/jpeg', 'image/png'];
const IMG_ACCEPT_ATTR = '.jpg,.jpeg,.png';
const ZIP_ACCEPTED = ['application/zip', 'application/x-zip-compressed', 'multipart/x-zip'];
const ZIP_ACCEPT_ATTR = '.zip';
const IMAGES_OR_ZIP_ACCEPT_ATTR = `${IMG_ACCEPT_ATTR},${ZIP_ACCEPT_ATTR}`;

export default function ProductUploadBulkDialog({ open, onClose }) {
  const csvInputRef = useRef(null);
  const imgInputRef = useRef(null);

  const [csvFile, setCsvFile] = useState(null);
  const [images, setImages] = useState([]);
  const [imagesZip, setImagesZip] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const csvInvalid = useMemo(() => {
    if (!csvFile) return null;
    const badType = !CSV_ACCEPTED.includes(csvFile.type);
    const tooBig = csvFile.size > MAX_SIZE;
    return { badType, tooBig };
  }, [csvFile]);

  const imgsInvalid = useMemo(() => {
    const badType = [];
    const tooBig = [];
    images.forEach((f) => {
      if (!IMG_ACCEPTED.includes(f.type)) badType.push(f.name);
      if (f.size > MAX_SIZE) tooBig.push(f.name);
    });
    return { badType, tooBig };
  }, [images]);

  const zipInvalid = useMemo(() => {
    if (!imagesZip) return null;
    const badType = !ZIP_ACCEPTED.includes(imagesZip.type) && !imagesZip.name?.toLowerCase()?.endsWith('.zip');
    const tooBig = imagesZip.size > MAX_SIZE;
    return { badType, tooBig };
  }, [imagesZip]);

  const onPickCsv = () => csvInputRef.current?.click();
  const onPickImages = () => imgInputRef.current?.click();

  const handleCsvFiles = useCallback((fileList) => {
    const f = (fileList && fileList[0]) || null;
    if (!f) return;
    setCsvFile(f);
    setResult(null);
  }, []);

  const isZipFile = (f) =>
    ZIP_ACCEPTED.includes(f.type) || (typeof f.name === 'string' && f.name.toLowerCase().endsWith('.zip'));

  const handleImageFiles = useCallback(
    (fileList) => {
      const arr = Array.from(fileList || []);
      if (!arr.length) return;

      const zip = arr.find((f) => isZipFile(f));
      if (zip) {
        setImagesZip(zip);
        setImages([]);
        setResult(null);
        return;
      }

      const onlyImgs = arr.filter((f) => IMG_ACCEPTED.includes(f.type));
      if (!onlyImgs.length) return;

      const map = new Map(images.map((x) => [x.name + x.size, x]));
      onlyImgs.forEach((f) => map.set(f.name + f.size, f));
      setImages(Array.from(map.values()));
      setImagesZip(null);
      setResult(null);
    },
    [images]
  );

  const onDropCsv = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files?.length) handleCsvFiles(e.dataTransfer.files);
    },
    [handleCsvFiles]
  );

  const onDropImages = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer?.files?.length) handleImageFiles(e.dataTransfer.files);
    },
    [handleImageFiles]
  );

  const clearAll = () => {
    setCsvFile(null);
    setImages([]);
    setImagesZip(null);
    setResult(null);
  };

  const hasValidImagesChoice = useMemo(() => {
    if (imagesZip) return !(zipInvalid?.badType || zipInvalid?.tooBig);
    if (images.length > 0) return imgsInvalid.badType.length === 0 && imgsInvalid.tooBig.length === 0;
    return false;
  }, [imagesZip, zipInvalid, images, imgsInvalid]);

  const disabledUpload =
    uploading ||
    !csvFile ||
    (csvInvalid && (csvInvalid.badType || csvInvalid.tooBig)) ||
    !hasValidImagesChoice;

  const buildImagesZip = useCallback(async (files) => {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();
    await Promise.all(
      files.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        zip.file(file.name, arrayBuffer);
      })
    );
    const blob = await zip.generateAsync({
      type: 'blob',
      compression: 'STORE',
    });
    return new File([blob], 'images.zip', { type: 'application/zip' });
  }, []);

  const handleUpload = useCallback(async () => {
    setUploading(true);
    setResult(null);
    try {
      if (disabledUpload) {
        setResult({ ok: false, message: 'Revisa los archivos seleccionados.' });
        setUploading(false);
        return;
      }

      const imagesZipFile = imagesZip ? imagesZip : await buildImagesZip(images);

      const resp = await uploadProduct({
        csvFile,
        imagesZipFile,
        warehouseId: 1,
        options: {},
      });

      const data = resp?.data ?? null;

      if (resp.ok && data && (data.success === true || data.job_id)) {
        const jobId = data.job_id ?? data?.jobId ?? null;
        toast.success(jobId ? `Importación iniciada — Job: ${jobId}` : 'Importación iniciada');
        setResult({ ok: true, message: data?.message ?? 'Carga iniciada' });
        setCsvFile(null);
        setImages([]);
        setImagesZip(null);
      } else if (resp.ok && data && data.success === false) {
        toast.error(data.message || 'No se pudo iniciar la importación');
        setResult({ ok: false, message: data.message || 'No se pudo completar la carga' });
      } else {
        toast.error(resp.message || 'Error al iniciar la importación');
        setResult({ ok: false, message: resp.message || 'No se pudo completar la carga' });
      }
    } catch (err) {
      console.error('[ProductUploadBulkDialog] upload error', err);
      toast.error(err?.message || 'Error en la carga');
      setResult({
        ok: false,
        message: err?.message || 'No se pudo completar la carga',
      });
    } finally {
      setUploading(false);
    }
  }, [csvFile, images, imagesZip, disabledUpload, buildImagesZip]);

  const dropZoneSx = (theme) => ({
    p: 3,
    borderRadius: 2,
    border: `1px dashed ${theme.vars?.palette?.divider || theme.palette.divider}`,
    bgcolor: 'background.paper',
    textAlign: 'center',
    cursor: 'pointer',
    '&:hover': {
      bgcolor: theme.vars ? `rgba(${theme.vars.palette.primary.mainChannel} / 0.04)` : 'action.hover',
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>Subir productos</DialogTitle>
      <DialogContent dividers sx={{ pt: 1.5 }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Incluye las medidas correctas (peso, longitud, ancho, alto, etc.), así nos aseguramos que el costo de envío sea exacto.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Formatos permitidos: CSV para datos y JPG/JPEG/PNG para imágenes, o un ZIP con imágenes.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Tamaño máximo por archivo: 5 MB.
            </Typography>
          </Stack>

          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, alignItems: 'start' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Archivo CSV</Typography>
              <Box onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={onDropCsv} onClick={onPickCsv} sx={dropZoneSx}>
                <Stack spacing={1.5} alignItems="center">
                  <Iconify icon="mdi:file-delimited" width={40} color="primary.main" />
                  <Typography variant="subtitle2">Haz clic o arrastra aquí tu archivo CSV</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{CSV_ACCEPT_ATTR.toUpperCase()} — máx. 5 MB</Typography>
                  <input ref={csvInputRef} type="file" accept={CSV_ACCEPT_ATTR} onChange={(e) => handleCsvFiles(e.target.files)} style={{ display: 'none' }} />
                </Stack>
              </Box>

              {!!csvFile && <Chip sx={{ alignSelf: 'flex-start' }} label={`${csvFile.name} (${Math.round(csvFile.size / 1024)} KB)`} onDelete={() => setCsvFile(null)} size="small" />}

              {csvFile && (csvInvalid?.badType || csvInvalid?.tooBig) && (
                <Alert severity="warning" variant="outlined">
                  {csvInvalid.badType && <div>El archivo CSV no tiene un tipo válido.</div>}
                  {csvInvalid.tooBig && <div>El CSV supera los 5 MB.</div>}
                </Alert>
              )}
            </Stack>

            <Stack spacing={1}>
              <Typography variant="subtitle2">Imágenes o ZIP</Typography>
              <Box onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }} onDrop={onDropImages} onClick={onPickImages} sx={dropZoneSx}>
                <Stack spacing={1.5} alignItems="center">
                  <Iconify icon="solar:zip-file-linear" width={40} color="primary.main" />
                  <Typography variant="subtitle2">Haz clic o arrastra aquí tus imágenes (JPG/JPEG/PNG) o un archivo ZIP</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{IMAGES_OR_ZIP_ACCEPT_ATTR.toUpperCase()} — máx. 5 MB por archivo/ZIP</Typography>
                  <input ref={imgInputRef} type="file" accept={IMAGES_OR_ZIP_ACCEPT_ATTR} multiple onChange={(e) => handleImageFiles(e.target.files)} style={{ display: 'none' }} />
                </Stack>
              </Box>

              {imagesZip ? (
                <Chip sx={{ alignSelf: 'flex-start' }} label={`${imagesZip.name} (${Math.round(imagesZip.size / 1024)} KB)`} onDelete={() => setImagesZip(null)} size="small" />
              ) : (
                !!images.length && <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{images.map((f) => <Chip key={f.name + f.size} label={`${f.name} (${Math.round(f.size / 1024)} KB)`} onDelete={() => setImages((prev) => prev.filter((x) => x !== f))} size="small" />)}</Box>
              )}

              {imagesZip ? (
                (zipInvalid?.badType || zipInvalid?.tooBig) && <Alert severity="warning" variant="outlined">{zipInvalid.badType && <div>El ZIP no tiene un tipo válido.</div>}{zipInvalid.tooBig && <div>El ZIP supera los 5 MB.</div>}</Alert>
              ) : (
                (imgsInvalid.badType.length > 0 || imgsInvalid.tooBig.length > 0) && (
                  <Alert severity="warning" variant="outlined">
                    {imgsInvalid.badType.length > 0 && <div>Imágenes con tipo no permitido: {imgsInvalid.badType.slice(0, 3).join(', ')}{imgsInvalid.badType.length > 3 ? '…' : ''}</div>}
                    {imgsInvalid.tooBig.length > 0 && <div>Imágenes que superan 5 MB: {imgsInvalid.tooBig.slice(0, 3).join(', ')}{imgsInvalid.tooBig.length > 3 ? '…' : ''}</div>}
                  </Alert>
                )
              )}
            </Stack>
          </Box>

          {result && (
            <Alert severity={result.ok ? 'success' : 'error'} icon={<Iconify icon={result.ok ? 'mdi:check-circle' : 'mdi:close-circle'} width={20} />}>
              {result.ok ? 'Carga exitosa' : 'Carga fallida'}{result.message ? ` — ${result.message}` : ''}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {!!csvFile || !!images.length || !!imagesZip ? <Button color="primary" onClick={clearAll} disabled={uploading} variant="text">Limpiar</Button> : null}
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={onClose} disabled={uploading} color="primary" variant="text">Cancelar</Button>
        <Button variant="contained" color="primary" onClick={handleUpload} disabled={disabledUpload} startIcon={<Iconify icon="solar:upload-minimalistic-bold" />}>
          {uploading ? 'Cargando…' : 'Cargar plantilla'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
