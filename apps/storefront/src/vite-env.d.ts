/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_STORE_SLUG?: string;
  readonly VITE_SITE_ROOT_DOMAIN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
