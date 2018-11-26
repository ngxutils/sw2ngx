export declare class Comparator {
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    static hammingDistance(x: string, y: string): number;
    /**
     * Calculates bit-wise similarity - Jaccard index.
     */
    static similarity(x: string, y: string): number;
    /**
     * Calculates Hamming weight (population count).
     */
    static hammingWeight(l: number): number;
}
