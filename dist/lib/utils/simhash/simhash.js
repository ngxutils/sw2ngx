"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var jenkins_1 = require("./jenkins");
var SimHash = /** @class */ (function () {
    function SimHash(options) {
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
    SimHash.prototype.hash = function (input) {
        var tokens = this.tokenize(input);
        var shingles = [];
        var jenkins = new jenkins_1.Jenkins();
        for (var i in tokens) {
            shingles.push(jenkins.hash32(tokens[i]));
        }
        var simhash = this.combineShingles(shingles);
        simhash >>>= 0;
        return simhash;
    };
    ;
    /**
     * Tokenizes input into 'kshingles' number of tokens.
     */
    SimHash.prototype.tokenize = function (original) {
        var size = original.length;
        if (size <= this.kshingles) {
            return [original.substr(0)];
        }
        var shingles = [];
        for (var i = 0; i < size; i = i + this.kshingles) {
            shingles.push(i + this.kshingles < size ? original.slice(i, i + this.kshingles) : original.slice(i));
        }
        return shingles;
    };
    ;
    SimHash.prototype.combineShingles = function (shingles) {
        if (shingles.length === 0)
            return;
        if (shingles.length === 1)
            return shingles[0];
        shingles.sort(this.hashComparator);
        if (shingles.length > this.maxFeatures)
            shingles = shingles.splice(this.maxFeatures);
        var simhash = 0x0;
        var mask = 0x1;
        for (var pos = 0; pos < 32; pos++) {
            var weight = 0;
            for (var i in shingles) {
                var shingle = parseInt(shingles[i], 16);
                weight += !(~shingle & mask) === true ? 1 : -1;
            }
            if (weight > 0)
                simhash |= mask;
            mask <<= 1;
        }
        return simhash;
    };
    ;
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    SimHash.prototype.hammingDistanceSlow = function (x, y) {
        var distance = 0;
        var val = parseInt(x, 16) ^ parseInt(y, 16);
        while (val) {
            ++distance;
            val &= val - 1;
        }
        return distance;
    };
    ;
    /**
     * TODO: Use a priority queue. Till then this comparator is
     * used to find the least 'maxFeatures' shingles.
     */
    SimHash.prototype.hashComparator = function (a, b) {
        return a < b ? -1 : (a > b ? 1 : 0);
    };
    ;
    return SimHash;
}());
exports.SimHash = SimHash;
;
//# sourceMappingURL=simhash.js.map