declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
  }

  interface ConfettiFn {
    (options?: Options): Promise<null> | null;
  }

  const confetti: ConfettiFn;
  export default confetti;
}
