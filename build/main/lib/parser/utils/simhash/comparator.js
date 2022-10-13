"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comparator = void 0;
class Comparator {
    /**
     * Calculates binary hamming distance of two base 16 integers.
     */
    static hammingDistance(x, y) {
        const a1 = parseInt(x, 16);
        const a2 = parseInt(y, 16);
        let v1 = a1 ^ a2;
        let v2 = (a1 ^ a2) >> 32;
        v1 = v1 - ((v1 >> 1) & 0x55555555);
        v2 = v2 - ((v2 >> 1) & 0x55555555);
        v1 = (v1 & 0x33333333) + ((v1 >> 2) & 0x33333333);
        v2 = (v2 & 0x33333333) + ((v2 >> 2) & 0x33333333);
        const c1 = (((v1 + (v1 >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
        const c2 = (((v2 + (v2 >> 4)) & 0xf0f0f0f) * 0x1010101) >> 24;
        return c1 + c2;
    }
    /**
     * Calculates bit-wise similarity - Jaccard index.
     */
    static similarity(x, y) {
        const x16 = parseInt(x, 16);
        const y16 = parseInt(y, 16);
        const i = x16 & y16;
        const u = x16 | y16;
        return Comparator.hammingWeight(i) / Comparator.hammingWeight(u);
    }
    /**
     * Calculates Hamming weight (population count).
     */
    static hammingWeight(l) {
        let c;
        for (c = 0; l; c++)
            l &= l - 1;
        return c;
    }
}
exports.Comparator = Comparator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9saWIvcGFyc2VyL3V0aWxzL3NpbWhhc2gvY29tcGFyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQSxNQUFhLFVBQVU7SUFDckI7O09BRUc7SUFDSCxNQUFNLENBQUMsZUFBZSxDQUFDLENBQVMsRUFBRSxDQUFTO1FBQ3pDLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDM0IsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQixJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDO1FBQ2pCLElBQUksRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUV6QixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLENBQUM7UUFDbkMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ25DLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQyxDQUFDO1FBQ2xELE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUM5RCxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFOUQsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFRDs7T0FFRztJQUNILE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBUyxFQUFFLENBQVM7UUFDcEMsTUFBTSxHQUFHLEdBQUcsUUFBUSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUM1QixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLE1BQU0sQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDcEIsTUFBTSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztRQUNwQixPQUFPLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNuRSxDQUFDO0lBRUQ7O09BRUc7SUFDSCxNQUFNLENBQUMsYUFBYSxDQUFDLENBQVM7UUFDNUIsSUFBSSxDQUFDLENBQUM7UUFDTixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQy9CLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztDQUNGO0FBdkNELGdDQXVDQyJ9