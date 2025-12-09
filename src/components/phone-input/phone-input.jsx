import { debounce } from 'es-toolkit';
import { useMemo, useState, useCallback } from 'react';
import PhoneNumberInput, { parsePhoneNumber } from 'react-phone-number-input/input';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { countries } from 'src/assets/data/countries';

import { Iconify } from '../iconify';
import { CountryListPopover } from './list-popover';

// ----------------------------------------------------------------------

export function PhoneInput({
  sx,
  size,
  label,
  placeholder,
  fullWidth = true,
  variant: variantProp,
  value,
  country,
  onChange,
  defaultCountry,
  hideSelect,
  ...other
}) {
  const theme = useTheme();
  const variant = variantProp ?? theme.components?.MuiTextField?.defaultProps?.variant;

  const normalizedValue = value ? value.trim().replace(/[\s-]+/g, '') : undefined;

  const [searchCountry, setSearchCountry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(
    parseCountryFromPhone(normalizedValue) ?? country ?? defaultCountry
  );

  const hasLabel = !!label;
  const isCountryLocked = !!country;

  const activeCountry = useMemo(() => {
    const parsedCountry = parseCountryFromPhone(normalizedValue);
    return parsedCountry ?? country ?? selectedCountry ?? defaultCountry;
  }, [country, selectedCountry, normalizedValue, defaultCountry]);

  const debouncedChange = useMemo(
    () => debounce((inputValue) => onChange(inputValue), 200),
    [onChange]
  );

  const handleChangeInput = useCallback(
    (inputValue) => {
      debouncedChange(inputValue ?? '');
    },
    [debouncedChange]
  );

  const handleClearInput = useCallback(() => {
    handleChangeInput('');
  }, [handleChangeInput]);

  const handleSearchCountry = useCallback((inputQuery) => {
    setSearchCountry(inputQuery);
  }, []);

  const handleSelectedCountry = useCallback(
    (countryCode) => {
      setSearchCountry('');
      handleClearInput();
      setSelectedCountry(countryCode);
    },
    [handleClearInput]
  );

  const renderSelect = () => (
    <CountryListPopover
      options={countries}
      searchCountry={searchCountry}
      selectedCountry={activeCountry}
      onSearchCountry={handleSearchCountry}
      onSelectedCountry={handleSelectedCountry}
      disabled={isCountryLocked}
      sx={{
        pl: variant === 'standard' ? 0 : 1.5,
        ...(variant === 'standard' && hasLabel && { mt: size === 'small' ? '16px' : '20px' }),
        ...((variant === 'filled' || variant === 'outlined') && {
          mt: size === 'small' ? '8px' : '16px',
        }),
        ...(variant === 'filled' && hasLabel && { mt: size === 'small' ? '21px' : '25px' }),
      }}
    />
  );

  const renderInput = () => {
    const textFieldProps = {
      size,
      label,
      variant,
      fullWidth,
      hiddenLabel: !label,
      placeholder: placeholder ?? 'Enter phone number',
      slotProps: {
        inputLabel: { shrink: true },
        input: {
          endAdornment: normalizedValue && (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleClearInput}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            </InputAdornment>
          ),
        },
      },
    };

    const phoneInputProps = {
      value: normalizedValue,
      onChange: handleChangeInput,
      inputComponent: CustomInput,
      ...(isCountryLocked ? { country: activeCountry } : { defaultCountry: activeCountry }),
    };

    // 'other' may include props for PhoneNumberInput (like forceCallingCode, onlyCountries, disableDropdown) —
    // CustomInput will strip unsupported DOM props before forwarding to MUI TextField.
    return <PhoneNumberInput {...textFieldProps} {...phoneInputProps} {...other} />;
  };

  const baseButtonWidth = variant === 'standard' ? '48px' : '60px';
  const disabledButtonWidth = `calc(${baseButtonWidth} - 16px)`;
  const buttonWidth = isCountryLocked ? disabledButtonWidth : baseButtonWidth;

  return (
    <Box
      sx={[
        {
          '--popover-button-mr': '12px',
          '--popover-button-height': '22px',
          '--popover-button-width': buttonWidth,
          position: 'relative',
          ...(fullWidth && { width: 1 }),
          ...(!hideSelect && {
            [`& .${inputBaseClasses.input}`]: {
              pl: 'calc(var(--popover-button-width) + var(--popover-button-mr))',
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {!hideSelect && renderSelect()}
      {renderInput()}
    </Box>
  );
}

// ----------------------------------------------------------------------
// CustomInput: strip props that would otherwise flow to DOM (forceCallingCode, onlyCountries, disableDropdown, country, defaultCountry, etc.)
// Accept both inputRef and ref for compatibility.
function CustomInput(props) {
  const {
    inputRef: inputRefProp,
    ref: refProp,
    // any other custom props to strip can be added here
    ...rest
  } = props;

  const inputRef = inputRefProp ?? refProp;
  return <TextField inputRef={inputRef} {...rest} />;
}

// ----------------------------------------------------------------------

function parseCountryFromPhone(inputValue) {
  const parsed = inputValue ? parsePhoneNumber(inputValue) : undefined;
  return parsed?.country ?? undefined;
}
