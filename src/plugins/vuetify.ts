import 'vuetify/lib/styles/main.css'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3B9EFF',
          'primary-lighten-1': '#7BBFFF',
          secondary: '#64748B',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
          background: '#F5F5F9',
          surface: '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VTextField: { variant: 'outlined', density: 'compact' },
    VSelect: { variant: 'outlined', density: 'compact' },
    VTextarea: { variant: 'outlined', density: 'compact' },
    VBtn: { rounded: 'lg' },
    VCard: { rounded: 'lg' },
    VChip: { size: 'small' },
  },
})
