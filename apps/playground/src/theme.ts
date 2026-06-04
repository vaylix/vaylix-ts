import { alpha, createTheme } from '@mui/material/styles';

export const playgroundTheme = createTheme({
  cssVariables: true,
  typography: {
    fontFamily:
      '"Sora Variable", "Sora", "Avenir Next", "Segoe UI", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.04em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      textTransform: 'none',
    },
    monospaceBody: {
      fontFamily:
        '"JetBrains Mono Variable", "JetBrains Mono", "SFMono-Regular", monospace',
      fontSize: '0.95rem',
      lineHeight: 1.7,
    },
  },
  palette: {
    mode: 'dark',
    primary: {
      main: '#7cf5d5',
    },
    secondary: {
      main: '#8ab4ff',
    },
    background: {
      default: '#07111a',
      paper: '#0e1824',
    },
    success: {
      main: '#7cf5d5',
    },
    warning: {
      main: '#fbbf24',
    },
    error: {
      main: '#ff7d7d',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          background:
            'radial-gradient(circle at top left, rgba(124, 245, 213, 0.12), transparent 24%), radial-gradient(circle at top right, rgba(138, 180, 255, 0.18), transparent 28%), linear-gradient(180deg, #07111a 0%, #09131e 100%)',
          color: theme.palette.text.primary,
        },
        '#root': {
          minHeight: '100vh',
        },
        '::selection': {
          backgroundColor: alpha(theme.palette.primary.main, 0.35),
        },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backdropFilter: 'blur(18px)',
          background:
            'linear-gradient(180deg, rgba(16, 26, 40, 0.94) 0%, rgba(9, 15, 24, 0.94) 100%)',
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
          boxShadow: `0 18px 70px ${alpha('#000000', 0.35)}`,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 999,
          border: `1px solid ${alpha(theme.palette.common.white, 0.08)}`,
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: alpha(theme.palette.common.black, 0.14),
        }),
      },
    },
  },
});
