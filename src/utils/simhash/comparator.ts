export class Comparator {
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    static hammingDistance(x: string, y: string) {
        const a1 = parseInt(x, 16);
        const a2 = parseInt(y, 16);
        let v1 = a1 ^ a2;
        let v2 = (a1 ^ a2) >> 32;

        v1 = v1 - ((v1 >> 1) & 0x55555555);
        v2 = v2 - ((v2 >> 1) & 0x55555555);
        v1 = (v1 & 0x33333333) + ((v1 >> 2) & 0x33333333);
        v2 = (v2 & 0x33333333) + ((v2 >> 2) & 0x33333333);
        const c1 = ((v1 + (v1 >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
        const c2 = ((v2 + (v2 >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;

        return c1 + c2;
    };

    /**
     * Calculates bit-wise similarity - Jaccard index.
     */
    static similarity(x: string, y: string) {
        const x16 = parseInt(x, 16);
        const y16 = parseInt(y, 16);
        const i = (x16 & y16);
        const u = (x16 | y16);
        return Comparator.hammingWeight(i) / Comparator.hammingWeight(u);
    };

    /**
     * Calculates Hamming weight (population count).
     */
    static hammingWeight(l: number): number {
        let c;
        for (c = 0; l; c++) l &= l - 1;
        return c;
    };

}