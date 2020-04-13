"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Jenkins = /** @class */ (function () {
    function Jenkins() {
        this.pc = 0;
        this.pb = 0;
        /**
         * Default first initial seed.
         */
        this.pc = 0;
        /**
         * Default second initial seed.
         */
        this.pb = 0;
    }
    // --------------------------------------------------
    // Public access
    // --------------------------------------------------
    /**
     * Computes and returns 32-bit hash of given message.
     */
    Jenkins.prototype.hash32 = function (msg) {
        var h = this.lookup3(msg, this.pc, this.pb);
        return (h.c).toString(16);
    };
    /**
     * Computes and returns 32-bit hash of given message.
     */
    Jenkins.prototype.hash64 = function (msg) {
        var h = this.lookup3(msg, this.pc, this.pb);
        return (h.b).toString(16) + (h.c).toString(16);
    };
    Jenkins.prototype.lookup3 = function (k, pc, pb) {
        var length = k.length;
        var a;
        var b;
        var c;
        a = b = c = 0xdeadbeef + length + pc;
        c += pb;
        var offset = 0;
        var mixed;
        while (length > 12) {
            a += k.charCodeAt(offset + 0);
            a += k.charCodeAt(offset + 1) << 8;
            a += k.charCodeAt(offset + 2) << 16;
            a += k.charCodeAt(offset + 3) << 24;
            b += k.charCodeAt(offset + 4);
            b += k.charCodeAt(offset + 5) << 8;
            b += k.charCodeAt(offset + 6) << 16;
            b += k.charCodeAt(offset + 7) << 24;
            c += k.charCodeAt(offset + 8);
            c += k.charCodeAt(offset + 9) << 8;
            c += k.charCodeAt(offset + 10) << 16;
            c += k.charCodeAt(offset + 11) << 24;
            mixed = this.mix(a, b, c);
            a = mixed.a;
            b = mixed.b;
            c = mixed.c;
            length -= 12;
            offset += 12;
        }
        switch (length) {
            case 12:
                c += k.charCodeAt(offset + 11) << 24;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 11:
                c += k.charCodeAt(offset + 10) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 10:
                c += k.charCodeAt(offset + 9) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 9:
                c += k.charCodeAt(offset + 8);
            // tslint:disable-next-line:no-switch-case-fall-through
            case 8:
                b += k.charCodeAt(offset + 7) << 24;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 7:
                b += k.charCodeAt(offset + 6) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 6:
                b += k.charCodeAt(offset + 5) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 5:
                b += k.charCodeAt(offset + 4);
            // tslint:disable-next-line:no-switch-case-fall-through
            case 4:
                a += k.charCodeAt(offset + 3) << 24;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 3:
                a += k.charCodeAt(offset + 2) << 16;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 2:
                a += k.charCodeAt(offset + 1) << 8;
            // tslint:disable-next-line:no-switch-case-fall-through
            case 1:
                a += k.charCodeAt(offset + 0);
                break;
            case 0:
                return { c: c >>> 0, b: b >>> 0 };
        }
        // Final mixing of three 32-bit values in to c
        mixed = this.finalMix(a, b, c);
        a = mixed.a;
        b = mixed.b;
        c = mixed.c;
        return { c: c >>> 0, b: b >>> 0 };
    };
    /**
     * Mixes 3 32-bit integers reversibly but fast.
     */
    Jenkins.prototype.mix = function (a, b, c) {
        a -= c;
        a ^= this.rot(c, 4);
        c += b;
        b -= a;
        b ^= this.rot(a, 6);
        a += c;
        c -= b;
        c ^= this.rot(b, 8);
        b += a;
        a -= c;
        a ^= this.rot(c, 16);
        c += b;
        b -= a;
        b ^= this.rot(a, 19);
        a += c;
        c -= b;
        c ^= this.rot(b, 4);
        b += a;
        return { a: a, b: b, c: c };
    };
    /**
     * Final mixing of 3 32-bit values (a,b,c) into c
     */
    Jenkins.prototype.finalMix = function (a, b, c) {
        c ^= b;
        c -= this.rot(b, 14);
        a ^= c;
        a -= this.rot(c, 11);
        b ^= a;
        b -= this.rot(a, 25);
        c ^= b;
        c -= this.rot(b, 16);
        a ^= c;
        a -= this.rot(c, 4);
        b ^= a;
        b -= this.rot(a, 14);
        c ^= b;
        c -= this.rot(b, 24);
        return { a: a, b: b, c: c };
    };
    /**
     * Rotate x by k distance.
     */
    Jenkins.prototype.rot = function (x, k) {
        return (((x) << (k)) | ((x) >> (32 - (k))));
    };
    return Jenkins;
}());
exports.Jenkins = Jenkins;
// --------------------------------------------------
// Private methods
// --------------------------------------------------
//# sourceMappingURL=jenkins.js.map