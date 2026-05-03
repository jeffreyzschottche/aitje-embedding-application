export default defineNuxtConfig({
  srcDir: '.',
  compatibilityDate: '2024-01-09',

  app: {
    head: {
      meta: [
        { name: 'robots', content: 'noindex, nofollow' },
      ],
    },
  },

  css: ['~/assets/css/tailwind.css'],

  modules: ['@pinia/nuxt'],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',
    },
  },

  devtools: { enabled: true },
});
