/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_IS_PRO: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
