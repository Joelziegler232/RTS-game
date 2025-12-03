// src/types/global.d.ts
declare global {
  interface Window {
    userNameCache: Record<string, string>;
  }
}

export {};