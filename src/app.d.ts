declare global {
  namespace App {}

  interface ImportMetaEnv {
    readonly VITE_SEED: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  declare const app_version: string;
}

export {};
