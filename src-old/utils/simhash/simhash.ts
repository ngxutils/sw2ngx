import {Jenkins} from './jenkins';

export interface ISimHashOptions {
    kshingles?: number;
    maxFeatures?: number;
}

export class SimHash {
    public kshingles = 4;
    public maxFeatures = 128;
    constructor(options?: ISimHashOptions) {
        if (options) {
            /**
             * By default, we tokenize input into chunks of this size.
             */
            if (options.kshingles) {
                this.kshingles = options.kshingles;
            }
            /**
             * By default, this many number of minimum shingles will 
             * be combined to create the final hash.
             */
            if (options.maxFeatures) {
                this.maxFeatures = options.maxFeatures;
            }
        }
    }

    // --------------------------------------------------
    // Public access
    // --------------------------------------------------

    /**
     * Driver function.
     */
    public hash(input: string) {
        const tokens = this.tokenize(input);
        const shingles = [];
        const jenkins = new Jenkins();
        // eslint-disable-next-line @typescript-eslint/no-for-in-array
        for (const i in tokens) {
            shingles.push(jenkins.hash32(tokens[i]));
        }
        let simhash = this.combineShingles(shingles);
        simhash >>>= 0;
        return simhash;
    }
    /**
     * Tokenizes input into 'kshingles' number of tokens.
     */
    private tokenize(original: string) {
        const size = original.length;
        if (size <= this.kshingles) {
            return [original.substr(0)];
        }

        const shingles = [];
        for (let i = 0; i < size; i = i + this.kshingles) {
            shingles.push(i + this.kshingles < size ? original.slice(i, i + this.kshingles) : original.slice(i));
        }
        return shingles;
    }

    private combineShingles(shingles: any[]) {
        if (shingles.length === 0) return;

        if (shingles.length === 1) return shingles[0];

        // eslint-disable-next-line @typescript-eslint/unbound-method
        shingles.sort(this.hashComparator);
        if (shingles.length > this.maxFeatures) shingles = shingles.splice(this.maxFeatures);

        let simhash = 0x0;
        let mask = 0x1;
        for (let pos = 0; pos < 32; pos++) {
            let weight = 0;
            // eslint-disable-next-line @typescript-eslint/no-for-in-array
            for (const i in shingles) {
                const shingle = parseInt(shingles[i], 16);
                weight += !(~shingle & mask) === true ? 1 : -1;
            }
            if (weight > 0) simhash |= mask;
            mask <<= 1;
        }

        return simhash;
    }



    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    private hammingDistanceSlow(x: string, y: string) {
        let distance = 0;
        let val = parseInt(x, 16) ^ parseInt(y, 16);
        while (val) {
            ++distance;
            val &= val - 1;
        }
        return distance;
    }

    /**
     * TODO: Use a priority queue. Till then this comparator is 
     * used to find the least 'maxFeatures' shingles.
     */
    public hashComparator(a: number, b: number) {
        return a < b ? -1 : (a > b ? 1 : 0);
    }
}



