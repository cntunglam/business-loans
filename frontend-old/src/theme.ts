import { extendTheme, type PaletteRange } from '@mui/joy/styles';

declare module '@mui/joy/styles' {
  interface ColorPalettePropOverrides {
    // apply to all Joy UI components that support `color` prop
    secondary: true;
    link: true;
    rsBackground: true;
    neutral: true;
    error: true;
    white: true;
    lightPrimary: true;
    lightSecondary: true;
  }

  interface Palette {
    // this will make the node `secondary` configurable in `extendTheme`
    // and add `secondary` to the theme's palette.
    secondary: PaletteRange;
    link: PaletteRange;
    neutral: PaletteRange & { greyLighter: string };
    error: PaletteRange;
    white: string;
    lightPrimary: PaletteRange;
    lightSecondary: PaletteRange;
  }

  interface PaletteBackground {
    rsBackground: string;
  }
}

declare module '@mui/joy/Button' {
  interface ButtonPropsColorOverrides {
    secondary: true;
    tertiary: true;
    white: true;
  }
}

const theme = extendTheme({
  fontFamily: {
    display: 'Proxima Nova',
    body: 'Proxima Nova'
  },
  shadow: {
    md: '0px 5px 10px 0px rgba(0, 0, 0, 0.1), 0px 4px 50px 0px rgba(0, 0, 0, 0.03)'
  },
  radius: {
    sm: '4px',
    md: '6px'
  },
  typography: {
    'title-lg': {
      fontWeight: 700
    },
    'title-md': {
      fontWeight: 700
    },
    'title-sm': {
      fontWeight: 700
    }
  },
  colorSchemes: {
    light: {
      palette: {
        white: '#FFF',
        background: {
          level1: '#FBFBFB',
          level2: '#F5F7F9',
          rsBackground: '#fcf9ff'
        },
        text: {
          primary: '#404549'
        },
        primary: {
          50: '#eefef6',
          100: '#76dcad',
          200: '#5fd6a0',
          300: '#48d192',
          400: '#31cb85',
          500: '#1AC577',
          600: '#159e5f',
          700: '#107647',
          800: '#0a4f30',
          900: '#052718',
          plainColor: 'var(--joy-palette-primary-500)',
          plainHoverBg: 'var(--joy-palette-primary-100)',
          plainActiveBg: 'var(--joy-palette-primary-200)',
          plainDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedColor: 'var(--joy-palette-primary-500)',
          outlinedBorder: 'var(--joy-palette-primary-300)',
          outlinedBg: 'var(--joy-palette-primary-50)',
          outlinedHoverBg: 'var(--joy-palette-primary-500)',
          outlinedHoverColor: '#FFF',
          outlinedActiveBg: 'var(--joy-palette-primary-200)',
          outlinedDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedDisabledBorder: 'var(--joy-palette-neutral-200)',
          softColor: 'var(--joy-palette-primary-700)',
          softBg: 'var(--joy-palette-primary-100)',
          softHoverBg: 'var(--joy-palette-primary-200)',
          softActiveBg: 'var(--joy-palette-primary-300)',
          softDisabledColor: 'var(--joy-palette-neutral-400)',
          softDisabledBg: 'var(--joy-palette-neutral-50)',
          solidColor: 'var(--joy-palette-common-white)',
          solidBg: 'var(--joy-palette-primary-500)',
          solidHoverBg: 'var(--joy-palette-secondary-500)',
          solidActiveBg: 'var(--joy-palette-primary-700)',
          solidDisabledColor: 'var(--joy-palette-neutral-400)',
          solidDisabledBg: 'var(--joy-palette-neutral-100)'
        },
        secondary: {
          '50': '#f2eefd',
          '100': '#d7cdfa',
          '200': '#c9bcf8',
          '300': '#ae9af4',
          '400': '#9577FF',
          '500': '#4F2B72',
          '600': '#6244CC',
          '700': '#48348e',
          '800': '#312266',
          '900': '#181133',
          solidBg: 'var(--joy-palette-secondary-500)',
          softColor: 'var(--joy-palette-secondary-700)',
          outlinedColor: 'var(--joy-palette-secondary-500)',
          outlinedBorder: 'var(--joy-palette-secondary-500)',
          softBg: 'var(--joy-palette-secondary-100)'
        },
        lightPrimary: {
          softBg: '#E9FFF5',
          softColor: 'var(--joy-palette-primary-700)'
        },
        lightSecondary: {
          softBg: '#FCF9FF',
          softColor: 'var(--joy-palette-secondary-700)'
        },
        link: {
          '500': '#2F80ED',
          plainColor: 'var(--joy-palette-link-500)',
          plainHoverBg: 'var(--joy-palette-link-100)',
          plainActiveBg: 'var(--joy-palette-link-200)',
          plainDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedColor: 'var(--joy-palette-link-500)',
          outlinedBorder: 'var(--joy-palette-link-500)',
          outlinedHoverBg: 'var(--joy-palette-link-100)',
          outlinedActiveBg: 'var(--joy-palette-link-200)',
          outlinedDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedDisabledBorder: 'var(--joy-palette-neutral-200)',
          softColor: 'var(--joy-palette-link-500)',
          softBg: 'var(--joy-palette-link-100)',
          softHoverBg: 'var(--joy-palette-link-200)',
          softActiveBg: 'var(--joy-palette-link-300)',
          softDisabledColor: 'var(--joy-palette-neutral-400)',
          softDisabledBg: 'var(--joy-palette-neutral-50)',
          solidColor: 'var(--joy-palette-common-white)',
          solidBg: 'var(--joy-palette-link-500)',
          solidHoverBg: 'var(--joy-palette-link-600)',
          solidActiveBg: 'var(--joy-palette-link-700)',
          solidDisabledColor: 'var(--joy-palette-neutral-400)',
          solidDisabledBg: 'var(--joy-palette-neutral-100)'
        },
        neutral: {
          800: '#DFDFDF',
          greyLighter: '#F7F7F7',
          plainColor: 'var(--joy-palette-neutral-700)',
          plainHoverBg: 'var(--joy-palette-neutral-100)',
          plainActiveBg: 'var(--joy-palette-neutral-200)',
          plainDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedColor: 'var(--joy-palette-neutral-700)',
          outlinedHoverBorder: '#48d192',
          outlinedHoverBg: '#fff',
          outlinedActiveBg: 'var(--joy-palette-neutral-200)',
          outlinedDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedDisabledBorder: 'var(--joy-palette-neutral-200)',
          softColor: 'var(--joy-palette-neutral-500)',
          softBg: 'var(--joy-palette-neutral-100)',
          softHoverBg: 'var(--joy-palette-neutral-200)',
          softActiveBg: 'var(--joy-palette-neutral-300)',
          softDisabledColor: 'var(--joy-palette-neutral-400)',
          softDisabledBg: 'var(--joy-palette-neutral-50)',
          solidColor: 'var(--joy-palette-common-white)',
          solidBg: 'var(--joy-palette-neutral-600)',
          solidHoverBg: 'var(--joy-palette-neutral-700)',
          solidActiveBg: 'var(--joy-palette-neutral-800)',
          solidDisabledColor: 'var(--joy-palette-neutral-400)',
          solidDisabledBg: 'var(--joy-palette-neutral-100)'
        },
        error: {
          '500': '#CC2A18',
          plainColor: 'var(--joy-palette-error-500)',
          plainHoverBg: 'var(--joy-palette-error-100)',
          plainActiveBg: 'var(--joy-palette-error-200)',
          plainDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedColor: 'var(--joy-palette-error-500)',
          outlinedBorder: 'var(--joy-palette-error-500)',
          outlinedHoverBg: 'var(--joy-palette-error-100)',
          outlinedActiveBg: 'var(--joy-palette-error-200)',
          outlinedDisabledColor: 'var(--joy-palette-neutral-400)',
          outlinedDisabledBorder: 'var(--joy-palette-neutral-200)',
          softColor: 'var(--joy-palette-error-500)',
          softBg: 'var(--joy-palette-error-100)',
          softHoverBg: 'var(--joy-palette-error-200)',
          softActiveBg: 'var(--joy-palette-error-300)',
          softDisabledColor: 'var(--joy-palette-neutral-400)',
          softDisabledBg: 'var(--joy-palette-neutral-50)',
          solidColor: 'var(--joy-palette-common-white)',
          solidBg: 'var(--joy-palette-error-500)',
          // solidHoverBg: "var(--joy-palette-error-600)",
          solidHoverBg: '#fff',
          solidActiveBg: 'var(--joy-palette-error-700)',
          solidDisabledColor: 'var(--joy-palette-neutral-400)',
          solidDisabledBg: 'var(--joy-palette-neutral-100)'
        }
      }
    }
  },
  components: {
    JoyListItemButton: {
      styleOverrides: {
        root: (props) => ({
          '.MuiTypography-root': {
            fontWeight: theme.typography['title-lg'].fontWeight,
            color: props.theme.palette.neutral[700]
          },
          '.MuiSvgIcon-root': {
            color: props.theme.palette.neutral[700]
          }
        })
      }
    },
    JoySkeleton: {
      defaultProps: {
        animation: 'wave'
      }
    },
    JoyTabs: {
      styleOverrides: {
        root: {
          '--Tab-indicatorThickness': '3px',
          backgroundColor: 'transparent'
        }
      }
    },
    JoyTable: {
      styleOverrides: {
        root: {
          th: {
            whiteSpace: 'pre-wrap'
          }
        }
      }
    },
    JoyTab: {
      defaultProps: {
        indicatorPlacement: 'bottom'
      },
      styleOverrides: {
        root: (props) => ({
          fontWeight: '700',
          color: props.theme.palette.neutral[500],

          '&.Mui-selected': {
            color: props.theme.palette.secondary[500],
            backgroundColor: 'var(--joy-palette-neutral-50)'
          }
        })
      }
    },
    JoyFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: 'var(--joy-fontSize-md)'
        }
      }
    },
    JoyMenu: {
      styleOverrides: {
        root: (props) => ({
          zIndex: props.ownerState.open ? 1300 : undefined
        })
      }
    },
    JoyTypography: {
      styleOverrides: {
        root: (props) => ({
          a: {
            color: props.theme.palette.primary[400],
            textDecoration: 'none',
            fontWeight: '500',
            '&:hover': {
              textDecoration: 'underline'
            }
          }
        })
      }
    },
    JoyChip: {
      styleOverrides: {
        root: {
          '.MuiChip-label': {
            zIndex: 0
          }
        }
      }
    },
    JoyButton: {
      styleOverrides: {
        root: () => ({
          borderRadius: 'var(--joy-radius-sm, 8px)',
          fontWeight: '700'
        })
      }
    },
    JoyModalDialog: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFF'
        }
      }
    }
  }
});

export default theme;
