/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WHATSAPP_API_URL: string
  readonly VITE_WHATSAPP_TOKEN: string
  readonly VITE_SMTP_HOST: string
  readonly VITE_SMTP_PORT: string
  readonly VITE_SMTP_USER: string
  readonly VITE_SMTP_PASS: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}