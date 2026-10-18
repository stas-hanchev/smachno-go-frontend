import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: { main: '#2E7D32' },
    secondary: { main: '#F57C00' },
    background: { default: '#F7F8F5' },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 },
  },
});
