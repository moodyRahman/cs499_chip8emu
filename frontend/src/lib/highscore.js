/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as chip8 from "$lib/chip8/debug.js";

export const highScoreInfo = {
    // ROM HASH : ["GAME TITLE", decodeType, numBytes, startAddr]
    26799: ["Breakout", 1, 2, 0x315],
    106009: ["Astrododge", 1, 4, 0x59C]//,
    //1 : ["SuperPong", 1, 2, 0x21B]
}

function romHash() {
    return
}

// Returns undefined if game isnt in database,
// null if highscore is requested at wrong time
// otherwise returns value of score
export default function highScore() {
    const decodeInfo = highScoreInfo[chip8.get_hash()];
    if (decodeInfo == undefined) return undefined;
    if (decodeInfo[1] == 1) {
        let ramDump = chip8.ram_dump();
        let score = 0;
        let bytesToRead = decodeInfo[2];
        let endingAddr = decodeInfo[3] + (bytesToRead - 1);
        for (let i = 0; i < bytesToRead; i++) {
            score += ramDump[endingAddr - i] * Math.pow(10, i);
        }
        return score;
    }
}