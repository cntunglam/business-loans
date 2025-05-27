// matomo.d.ts (or in your component file)
export {};

declare global {
  interface Window {
    //@ts-expect-error injected script
    //eslint-disable-next-line
    _paq: any[][];
    _mtm: any[];
  }
}
