export declare class Jenkins {
    pc: number;
    pb: number;
    constructor();
    /**
     * Computes and returns 32-bit hash of given message.
     */
    hash32(msg: string): string;
    /**
     * Computes and returns 32-bit hash of given message.
     */
    hash64(msg: string): string;
    private lookup3;
    /**
     * Mixes 3 32-bit integers reversibly but fast.
     */
    private mix;
    /**
     * Final mixing of 3 32-bit values (a,b,c) into c
     */
    private finalMix;
    /**
     * Rotate x by k distance.
     */
    private rot;
}
