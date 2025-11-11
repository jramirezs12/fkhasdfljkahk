'use client';

import parse from 'autosuggest-highlight/parse';
import match from 'autosuggest-highlight/match';
import { useDebounce } from 'minimal-shared/hooks';
import { useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Link, { linkClasses } from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete, { autocompleteClasses } from '@mui/material/Autocomplete';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useGetProducts } from 'src/actions/product/product';

import { Iconify } from 'src/components/iconify';
import { SearchNotFound } from 'src/components/search-not-found';

export function ProductSearch({ redirectPath, sx }) {
  const router = useRouter();

  const { products } = useGetProducts(); // usamos lo que ya está en memoria para sugerencias

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  const debouncedQuery = useDebounce(searchQuery);

  const { options, loading } = useSearchData(debouncedQuery, products);

  const handleChange = useCallback(
    (item) => {
      setSelectedItem(item);
      if (item) {
        router.push(redirectPath(item.id));
      }
    },
    [redirectPath, router]
  );

  const paperStyles = {
    width: 320,
    [`& .${autocompleteClasses.listbox}`]: {
      [`& .${autocompleteClasses.option}`]: {
        p: 0,
        [`& .${linkClasses.root}`]: {
          px: 1,
          py: 0.75,
          width: 1,
        },
      },
    },
  };

  return (
    <Autocomplete
      autoHighlight
      popupIcon={null}
      loading={loading}
      options={options}
      value={selectedItem}
      onChange={(event, newValue) => handleChange(newValue)}
      onInputChange={(event, newValue) => setSearchQuery(newValue)}
      getOptionLabel={(option) => option.name}
      noOptionsText={<SearchNotFound query={debouncedQuery} />}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      slotProps={{ paper: { sx: paperStyles } }}
      sx={[{ width: { xs: 1, sm: 260 } }, ...(Array.isArray(sx) ? sx : [sx])]}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="Search..."
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ ml: 1, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} color="inherit" sx={{ mr: -3 }} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      renderOption={(props, option, state) => {
        const { key, ...otherProps } = props;
        const matches = match(option.name, state.inputValue, { insideWords: true });
        const parts = parse(option.name, matches);

        return (
          <li key={key} {...otherProps}>
            <Link
              component={RouterLink}
              href={redirectPath(option.id)}
              color="inherit"
              underline="none"
            >
              {parts.map((part, index) => (
                <Box
                  key={index}
                  component="span"
                  sx={{
                    typography: 'body2',
                    fontWeight: 'fontWeightMedium',
                    ...(part.highlight && {
                      color: 'primary.main',
                      fontWeight: 'fontWeightSemiBold',
                    }),
                  }}
                >
                  {part.text}
                </Box>
              ))}
            </Link>
          </li>
        );
      }}
    />
  );
}

function useSearchData(searchQuery, products) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  const dataset = useMemo(() => (Array.isArray(products) ? products : []), [products]);

  const fetchSearchResults = useCallback(async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const q = (searchQuery || '').toLowerCase();
      const results = q
        ? dataset.filter(({ name, sku }) =>
            [name, sku].some((field) => field?.toLowerCase().includes(q))
          )
        : [];
      setOptions(results.slice(0, 20));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dataset, searchQuery]);

  useEffect(() => {
    if (searchQuery) {
      fetchSearchResults();
    } else {
      setOptions([]);
    }
  }, [fetchSearchResults, searchQuery]);

  return { options, loading };
}
