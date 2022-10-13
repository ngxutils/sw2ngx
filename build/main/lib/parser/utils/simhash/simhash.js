"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimHash = void 0;
const jenkins_1 = require("./jenkins");
class SimHash {
    constructor(options) {
        this.kshingles = 4;
        this.maxFeatures = 128;
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
        const jenkins = new jenkins_1.Jenkins();
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
exports.SimHash = SimHash;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltaGFzaC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3NpbWhhc2gvc2ltaGFzaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSx1Q0FBb0M7QUFPcEMsTUFBYSxPQUFPO0lBR2xCLFlBQVksT0FBeUI7UUFGOUIsY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLGdCQUFXLEdBQUcsR0FBRyxDQUFDO1FBRXZCLElBQUksT0FBTyxFQUFFO1lBQ1g7O2VBRUc7WUFDSCxJQUFJLE9BQU8sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQzthQUNwQztZQUNEOzs7ZUFHRztZQUNILElBQUksT0FBTyxDQUFDLFdBQVcsRUFBRTtnQkFDdkIsSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxDQUFDO2FBQ3hDO1NBQ0Y7SUFDSCxDQUFDO0lBRUQscURBQXFEO0lBQ3JELGdCQUFnQjtJQUNoQixxREFBcUQ7SUFFckQ7O09BRUc7SUFDSSxJQUFJLENBQUMsS0FBYTtRQUN2QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3BDLE1BQU0sUUFBUSxHQUFHLEVBQUUsQ0FBQztRQUNwQixNQUFNLE9BQU8sR0FBRyxJQUFJLGlCQUFPLEVBQUUsQ0FBQztRQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLE1BQU0sRUFBRTtZQUN0QixRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUMxQztRQUNELElBQUksT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDN0MsT0FBTyxNQUFNLENBQUMsQ0FBQztRQUNmLE9BQU8sT0FBTyxDQUFDO0lBQ2pCLENB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