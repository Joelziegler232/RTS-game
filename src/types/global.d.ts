
declare global {
  interface Window {
    userNameCache: Record<string, string>;
  }
}

export {};