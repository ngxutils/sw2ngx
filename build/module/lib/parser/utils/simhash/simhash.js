import { Jenkins } from './jenkins';
export class SimHash {
    kshingles = 4;
    maxFeatures = 128;
    constructor(options) {
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
    hash(input) {
        const tokens = this.tokenize(input);
        const shingles = [];
        const jenkins = new Jenkins();
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
    tokenize(original) {
        const size = original.length;
        if (size <= this.kshingles) {
            return [original.substr(0)];
        }
        const shingles = [];
        for (let i = 0; i < size; i = i + this.kshingles) {
            shingles.push(i + this.kshingles < size
                ? original.slice(i, i + this.kshingles)
                : original.slice(i));
        }
        return shingles;
    }
    combineShingles(shingles) {
        if (shingles.length === 0)
            return;
        if (shingles.length === 1)
            return shingles[0];
        // eslint-disable-next-line @typescript-eslint/unbound-method
        shingles.sort(this.hashComparator);
        if (shingles.length > this.maxFeatures)
            shingles = shingles.splice(this.maxFeatures);
        let simhash = 0x0;
        let mask = 0x1;
        for (let pos = 0; pos < 32; pos++) {
            let weight = 0;
            // eslint-disable-next-line @typescript-eslint/no-for-in-array
            for (const i in shingles) {
                const shingle = parseInt(shingles[i], 16);
                weight += !(~shingle & mask) === true ? 1 : -1;
            }
            if (weight > 0)
                simhash |= mask;
            mask <<= 1;
        }
        return simhash;
    }
    /**
     * TODO: Use a priority queue. Till then this comparator is
     * used to find the least 'maxFeatures' shingles.
     */
    hashComparator(a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3NpbWhhc2gvc2ltaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBT3BDLE1BQU0sT0FBTyxPQUFPO0lBQ1gsU0FBUyxHQUFHLENBQUMsQ0FBQztJQUNkLFdBQVcsR0FBRyxHQUFHLENBQUM7SUFDekIsWUFBWSxPQUF5QjtRQUNuQyxJQUFJLE9BQU8sRUFBRTtZQUNYOztlQUVHO1lBQ0gsSUFBSSxPQUFPLENBQUMsU0FBUyxFQUFFO2dCQUNyQixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUM7YUFDcEM7WUFDRDs7O2VBR0c7WUFDSCxJQUFJLE9BQU8sQ0FBQyxXQUFXLEVBQUU7Z0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFDLFdBQVcsQ0FBQzthQUN4QztTQUNGO0lBQ0gsQ0FBQztJQUVELHFEQUFxRDtJQUNyRCxnQkFBZ0I7SUFDaEIscURBQXFEO0lBRXJEOztPQUVHO0lBQ0ksSUFBSSxDQUFDLEtBQWE7UUFDdkIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQyxNQUFNLFFBQVEsR0FBRyxFQUFFLENBQUM7UUFDcEIsTUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsT0FBTyxNQUFNLENBQUMsQ0FBQztR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