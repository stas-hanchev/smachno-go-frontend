import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    mint: { main: string; light: string; contrastText: string };
    muted: string;
    overlay: string;
  }
  interface PaletteOptions {
    mint?: { main: string; light: string; contrastText: string };
    muted?: string;
    overlay?: string;
  }
}

const FONT_FAMILY = 'var(--font-manrope), system-ui, -apple-system, "Segoe UI", sans-serif';

export const radii = {
  card: 20,
  cardLarge: 24,
  button: 12,
  badge: 8,
  badgeSmall: 4,
  pill: 9999,
} as const;

export const shadows = {
  card: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  raised: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -4px rgba(0, 0, 0, 0.1)',
  header: '0px 1px 8px rgba(0, 0, 0, 0.04)',
} as const;

const base = createTheme({
  breakpoints: { values: { xs: 0, sm: 600, md: 1024, lg: 1280, xl: 1536 } },
});

export const theme = createTheme(base, {
  palette: {
    primary: { main: '#0F5C56', dark: '#00433E', contrastText: '#FFFFFF' },
    secondary: { main: '#94F5D4', contrastText: '#002118' },
    success: { main: '#006B54', contrastText: '#FFFFFF' },
    error: { main: '#C62828' },
    text: { primary: '#0D1F1C', secondary: '#3F4947' },
    divider: '#BEC9C6',
    background: { default: '#EFFCF8', paper: '#FFFFFF' },
    mint: { main: '#94F5D4', light: '#E3F8F3', contrastText: '#002118' },
    muted: '#6F7977',
    overlay: 'rgba(13, 31, 28, 0.75)',
  },
  shape: { borderRadius: radii.button },
  typography: {
    fontFamily: FONT_FAMILY,
    h1: {
      fontSize: 48,
      lineHeight: '56px',
      letterSpacing: '-1.2px',
      fontWeight: 800,
      [base.breakpoints.down('sm')]: { fontSize: 32, lineHeight: '40px', letterSpacing: '-0.8px' },
    },
    h2: {
      fontSize: 36,
      lineHeight: '44px',
      letterSpacing: '-0.36px',
      fontWeight: 800,
      [base.breakpoints.down('sm')]: { fontSize: 26, lineHeight: '34px' },
    },
    h3: { fontSize: 20, lineHeight: '28px', fontWeight: 700 },
    h4: { fontSize: 24, lineHeight: '32px', fontWeight: 700 },
    h5: { fontSize: 18, lineHeight: '26px', fontWeight: 700 },
    h6: { fontSize: 16, lineHeight: '24px', fontWeight: 700 },
    subtitle1: { fontSize: 16, lineHeight: '24px', fontWeight: 600 },
    subtitle2: { fontSize: 14, lineHeight: '20px', fontWeight: 700 },
    body1: {
      fontSize: 18,
      lineHeight: '29px',
      [base.breakpoints.down('sm')]: { fontSize: 16, lineHeight: '26px' },
    },
    body2: { fontSize: 14, lineHeight: '20px' },
    caption: { fontSize: 12, lineHeight: '16px' },
    overline: { fontSize: 14, lineHeight: '20px', fontWeight: 700, letterSpacing: '0.7px' },
    button: { textTransform: 'none', fontWeight: 700, fontSize: 14, lineHeight: '20px' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
        a: { color: 'inherit' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: radii.button, padding: '10px 16px' },
        sizeLarge: { fontSize: 16, lineHeight: '24px', padding: '14px 28px' },
        sizeSmall: { padding: '6px 12px' },
      },
    },
    MuiIconButton: { styleOverrides: { root: { borderRadius: radii.pill } } },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: radii.pill, fontWeight: 700 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: { root: { borderRadius: radii.card, boxShadow: shadows.card } },
    },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: radii.card } } },
    MuiInputBase: { styleOverrides: { root: { fontSize: 16, lineHeight: '24px' } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.button,
          backgroundColor: '#E3F8F3',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#BEC9C6' },
        },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { fontSize: 16 } } },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 4 } } },
    MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 700, fontSize: 14 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: radii.button } } },
    MuiDialog: { styleOverrides: { paper: { borderRadius: radii.cardLarge } } },
    MuiLink: { defaultProps: { underline: 'hover' } },
  },
});
