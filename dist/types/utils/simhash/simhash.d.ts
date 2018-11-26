export interface ISimHashOptions {
    kshingles?: number;
    maxFeatures?: number;
}
export declare class SimHash {
    kshingles: number;
    maxFeatures: number;
    constructor(options?: ISimHashOptions);
    /**
     * Driver function.
     */
    hash(input: string): any;
    /**
     * Tokenizes input into 'kshingles' number of tokens.
     */
    private tokenize;
    private combineShingles;
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    private hammingDistanceSlow;
    /**
     * TODO: Use a priority queue. Till then this comparator is
     * used to find the least 'maxFeatures' shingles.
     */
    hashComparator(a: number, b: number): 0 | 1 | -1;
}
