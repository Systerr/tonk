declare module '@automerge/automerge/automerge.wasm' {
  const wasmUrl: string;
  export default wasmUrl;
}

declare module '@automerge/automerge/slim' {
  export const next: any;
}
