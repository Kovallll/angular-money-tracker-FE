import Aura from '@primeuix/themes/aura';
import { definePreset } from '@primeuix/styled';

export const ThemePreset = definePreset(Aura, {
  semantic: {
    primary: {
      100: '#0f172aaa',
      200: '#0f172abc',
      300: '#0f172afa',
      400: '#0f172a',
      500: '#0d1525',
      600: '#0a101c',
      700: '#080c13',
      800: '#05080c',
      900: '#05080c',
    },
  },
  components: {
    button: {
      colorScheme: {
        dark: {
          root: {
            primary: {
              background: 'transparent',
              hoverBackground: '#3b82f6',
              hoverColor: '#ffffff',
              color: '#ffffff',
              borderColor: '#3b82f6',
            },
          },
        },
      },
    },
    floatlabel: {
      colorScheme: {
        dark: {
          root: {
            color: '#ffffff',
            activeColor: '#ffffff',
          },
        },
      },
    },
    inputtext: {
      colorScheme: {
        dark: {
          root: {
            background: '#0f172a',
            color: '#ffffff',
            placeholderColor: '#94a3b8',
          },
        },
      },
    },
    select: {
      colorScheme: {
        dark: {
          root: {
            background: '#0f172a',
            color: '#ffffff',
            placeholderColor: '#94a3b8',
          },
        },
      },
    },
    dialog: {
      colorScheme: {
        dark: {
          root: {
            background: '#1d283a',
            color: '#ffffff',
          },
        },
      },
    },
  },
});
