export type PRNG = {
  nextFloat01(): number; // [0,1)
  nextInt(maxExclusive: number): number; // [0,max)
};

export function createPrngFromString(seed: string): PRNG {
  let state = fnv1a32(seed) || 1;
  return {
    nextFloat01() {
      // xorshift32
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      // >>> 0 keeps it uint32
      return ((state >>> 0) % 0x100000000) / 0x100000000;
    },
    nextInt(maxExclusive: number) {
      if (maxExclusive <= 0) return 0;
      return Math.floor(this.nextFloat01() * maxExclusive);
    },
  };
}

function fnv1a32(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

