/// <reference types="vite/client" />

declare global {
  interface Window {
    __VITE_API_URL__?: string;
  }
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
