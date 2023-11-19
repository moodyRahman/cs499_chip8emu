import { add } from "$lib/chip8/debug";
import { error } from "@sveltejs/kit";

// Table to map instruction to their respective argument check/parse function
const argVerifyTable = {
    "CLS" : noArg,
    "RET" : noArg,
    "SYS" : addrArg,
    "JP"  : jpArg,
    "CALL": addrArg,
    "SE"  : seArg,
    "SNE" : sneArg,
    "LD"  : ldArg, //WIP!!!!
    "ADD" : addArg,
    "OR"  : regRegArg,
    "AND" : regRegArg,
    "XOR" : regRegArg,
    "SUB" : regRegArg,
    "SHR" : [regArg, regRegArg],
    "SUBN": regRegArg,
    "SHL" : [regArg, regRegArg],
    "RND" : regByteArg,
    "DRW" : regRegNibArg, 
    "SKP" : regArg,
    "SKPN": regArg
};

// Below are the functions used to check the argument
// validity and parse them if valid

function noArg(words){
    if (words.length != 1) return 0;
    return -1;
}

function addrArg(words){
    if (words.length != 2) return 1;
    if (+words[1] > 4095 || +words[1] < 0) return 4;
    return -1;
}

function regArg(words){
    if (words.length != 2) return 1;
    // Check if register A is in a valid format
    if (words[1][0] != "V") return 5;
    const regA = +words[1].substring(1);
    if (isNaN(regA)) return 6;
    if (regA < 0 || regA > 15) return 6;
    // If all checks are passed, write back the parsed argument
    words[1] = regA;
    return -1;
}

function regByteArg(words){
    if (words.length != 3) return 2;
    // Check if register A is in a valid format
    if (words[1][0] != "V") return 5;
    if (words[1][words[1].length-1] != ",") return 7;
    const regA = +words[1].substring(1, words[1].length-1);
    if (isNaN(regA)) return 6;
    if (regA < 0 || regA > 15) return 6;
    // Check if data byte is in a valid format
    const byteValue = +words[2];
    if (isNaN(byteValue)) return 8;
    if (byteValue < 0 || byteValue > 255) return 9;
    // If all checks are passed, write back the parsed arguments
    words[1] = regA;
    words[2] = byteValue;
    return -1;
}

function regRegArg(words){
    if (words.length != 3) return 2;
    // Check if register A is in a valid format
    if (words[1][0] != "V") return 5;
    if (words[1][words[1].length-1] != ",") return 7;
    const regA = +words[1].substring(1, words[1].length-1);
    if (isNaN(regA)) return 6;
    if (regA < 0 || regA > 15) return 6;
    // Check if register B is in a valid format
    if (words[2][0] != "V") return 5;
    const regB = +words[2].substring(1);
    if (isNaN(regB)) return 6;
    if (regB < 0 || regB > 15) return 6;
    // If all checks are passed, write back the parsed arguments
    words[1] = regA;
    words[2] = regB;
    return -1;
}

function regRegNibArg(words){
    if (words.length != 4) return 3;
    // Check if register A is in a valid format
    if (words[1][0] != "V") return 5;
    if (words[1][words[1].length-1] != ",") return 7;
    const regA = +words[1].substring(1, words[1].length-1);
    if (isNaN(regA)) return 6;
    if (regA < 0 || regA > 15) return 6;
    // Check if register B is in a valid format
    if (words[2][0] != "V") return 5;
    if (words[2][words[2].length-1] != ",") return 7;
    const regB = +words[2].substring(1, words[2].length-1);
    if (isNaN(regB)) return 6;
    if (regB < 0 || regB > 15) return 6;
    // Check if data nibble is in a valid format
    const nibbleValue = +words[3];
    if (isNaN(nibbleValue)) return 10;
    if (nibbleValue < 0 || nibbleValue > 15) return 11;
    // If all checks are passed, write back the parsed arguments
    words[1] = regA;
    words[2] = regB;
    words[3] = nibbleValue;
    return -1;
}

// 0 stores INS, 1 stores addr, 3 stores jp type, 2 stores int/label
function jpArg(words){
    if (addrArg(words) == -1) {
        words[3] = 0;
        return -1
    }
    if (words[1] == "V0,") {
        if (words.length != 3) return 2;
        if (+words[2] > 4095 || +words[2] < 0) return 4;
        words[3] = 1;
        return -1
    }
    return 12;
}

function seArg(words){
    if (regByteArg(words) == -1) {
        words[1] = 0x30 | words[1];
        return -1;
    }
    if (regRegArg(words) == -1) {
        words[1] = 0x50 | words[1];
        words[2] = words[2] << 4;
        return -1;
    }
    return 12;
}

function sneArg(words){
    if (regByteArg(words) == -1) {
        words[1] = 0x40 | words[1];
        return -1;
    }
    if (regRegArg(words) == -1) {
        words[1] = 0x90 | words[1];
        words[2] = words[2] << 4;
        return -1;
    }
    return 12;
}

function ldArg(words){
    if (regByteArg(words) == -1) {
        words[1] = 0x60 | words[1];
        return -1;
    }
    if (regRegArg(words) == -1) {
        words[1] = 0x80 | words[1];
        words[2] = words[2] << 4;
        return 12;
    }
    if (words.length != 3) return 2;
    words[3] = 0;
    if (words[1] == "I,") {
        if (+words[1] > 4095 || +words[1] < 0) return 4;
        words[3] = 1;
        return -1;
    }
    if (words[1][0] == "V") {
        if (words[1][words[1].length-1] != ",") return 7;
        const regA = +words[1].substring(1, words[1].length-1);
        if (isNaN(regA)) return 6;
        if (regA < 0 || regA > 15) return 6;
        switch (words[2]) {
            case ("DT"):
                words[2] = 0x07;
                break;
            case ("K"):
                words[2] = 0x0A;
                break;
            case ("[I]"):
                words[2] = 0x65;
                break;
            default:
                return 12;
        }
        words[1] = 0xF0 | regA;
        return -1;
    } else if (words[2][0] == "V") {
        const regB = +words[2].substring(1);
        if (isNaN(regB)) return 6;
        if (regB < 0 || regB > 15) return 6;
        switch (words[1]) {
            case ("DT,"):
                words[2] = 0x15;
                break;
            case ("ST,"):
                words[2] = 0x18;
                break;
            case ("F,"):
                words[2] = 0x29;
                break;
            case ("B,"):
                words[2] = 0x33;
                break;
            case ("[I],"):
                words[2] = 0x55;
                break;
            default:
                return 12;
        }
        words[1] = 0xF0 | regB;
        return -1;
    }
    return 12;
}

function addArg(words){
    if (regByteArg(words) == -1) {
        words[1] = 0x70 | words[1];
        return -1;
    }
    if (regRegArg(words) == -1) {
        words[1] = 0x80 | words[1];
        words[2] = 0x4 | (words[2] << 4);
        return -1;
    }
    if (words.length != 3) return 2;
    if (words[1] != "I,") return 12;
    if (words[2][0] != "V") return 5;
    const regB = +words[2].substring(1);
    if (isNaN(regB)) return 6;
    if (regB < 0 || regB > 15) return 6;
    words[1] = 0xF0 | regB;
    words[2] = 0x1E;
    return -1;
}

// Below is the function to handle errors in argument parsing
/*
ARGUMENT ERROR CODES (when format is invalid)
---------------------------------------------
 -1 : No Error
 0-3: Wrong argument count (value indicates expected count)
  4 : Addr out of bounds
  5 : Missing reg identifier
  6 : Invalid reg number
  7 : Missing comma 
  8 : Invalid byte value
  9 : Byte value out of range
  10: Invalid nibble value
  11: Nibble value out of range 
  12: Other arg error
*/

function argumentErrorHandler(errorCode, lineNumber){
    switch(errorCode) {
        case (-1):
            throw new Error(`Critical Assembler Error, in line ${lineNumber}, valid arg triggered error handler!`);
        case (0):
            throw new Error(`Argument Error, in line ${lineNumber}, expected 0 arguments!`);
        case (1):
            throw new Error(`Argument Error, in line ${lineNumber}, expected 1 arguments!`);
        case (2):
            throw new Error(`Argument Error, in line ${lineNumber}, expected 2 arguments!`);
        case (3):
            throw new Error(`Argument Error, in line ${lineNumber}, expected 3 arguments!`);
        case (4):
            throw new Error(`Argument Error, in line ${lineNumber}, address is out of bounds!`);
        case (5):
            throw new Error(`Argument Error, in line ${lineNumber}, missing register identifier!`);
        case (6):
            throw new Error(`Argument Error, in line ${lineNumber}, invalid register number!`);
        case (7):
            throw new Error(`Argument Error, in line ${lineNumber}, missing comma seperator!`);
        case (8):
            throw new Error(`Argument Error, in line ${lineNumber}, invalid byte value!`);
        case (9):
            throw new Error(`Argument Error, in line ${lineNumber}, byte value out of bounds!`);
        case (10):
            throw new Error(`Argument Error, in line ${lineNumber}, invalid nibble value!`);
        case (11):
            throw new Error(`Argument Error, in line ${lineNumber}, nibble value out of bounds!`);
        case (12):
            throw new Error(`Argument Error, in line ${lineNumber}!`);
        default:
            throw new Error(`Critical Assembler Error, in line ${lineNumber}, unkown arg error code!`);
    }
}

function preProcessStrip(rawASM = "") {
    const rawLines = rawASM.split("\n");
    const cleanLines = [];
    const lineNumberTable = [];
    // Remove whitespace, comments and blank lines, make table of line numbers
    let lineCount = 0;
    for (const line of rawLines){
        lineCount++;
        const trimmedLine = line.trim();
        if (trimmedLine.length != 0){
            if (trimmedLine[0] != "#"){
                const commentSplit = trimmedLine.split("#");
                cleanLines.push(commentSplit[0].trim());
                lineNumberTable.push(lineCount);
            }
        }
    }
    return [cleanLines, lineNumberTable];
}

export default function assemble(ASM = ""){
    // First strip out comments, blank lines and whitespace
    const strippedData = preProcessStrip(ASM);
    const cleanLines = strippedData[0];
    const lineNumberTable = strippedData[1];
    // 
    const finalRom = new Uint8Array(4096);
    const labelTable = {};
    const labelRequestTable = [];
    let addr = 0;
    let lineCount = 0;
    const parserDebugTable = []
    for (const line of cleanLines){
        if (line[0] == "."){
            if (line.substring(1,5) == "org "){
                const orgArg = +line.substring(5)
                if (!isNaN(orgArg)) {
                    if (orgArg >= addr) {
                        addr = orgArg;
                        parserDebugTable.push(`ORG: ${orgArg}`)
                    } else {
                        throw new Error(`Alignment Error, cannot align chunk without clobbering memory as defined in line ${lineNumberTable[lineCount]}!`);
                    } 
                } else {
                    throw new Error(`Argument Error, unknown directive argument in line ${lineNumberTable[lineCount]}!`);
                }
            } else {
                throw new Error(`Syntax Error, unknown directive in line ${lineNumberTable[lineCount]}!`);
            }
        } else if (line[line.length-1] == ":") {
            if (addr+4 > 4095) {
                throw new Error(`Memory Error, program exceedes memory limit at line ${lineNumberTable[lineCount]}!`);  
            }
            if (line.length == 1) {
                throw new Error(`Label Error, no label name in line ${lineNumberTable[lineCount]}!`);
            } 
            const labelArg = line.substring(0, line.length-1)
            if (!isNaN(+labelArg)) {
                throw new Error(`Label Error, label name cannot be a number in line ${lineNumberTable[lineCount]}!`);
            }
            if (labelTable[labelArg] == undefined) {
                labelTable[labelArg] = addr;
                parserDebugTable.push(`Label : ${addr}`)
            } else {
                throw new Error(`Label Error, duplicate label name in line ${lineNumberTable[lineCount]}!`);   
            }
        } else {
            if (addr+4 > 4095) {
                throw new Error(`Memory Error, program exceedes memory limit at line ${lineNumberTable[lineCount]}!`);  
            }
            const words = line.split(" ");
            const checkerFunction = argVerifyTable[words[0]];
            if (checkerFunction == undefined) {
                throw new Error(`Syntax Error, unknown instruction in line ${lineNumberTable[lineCount]}!`);
            } else if (typeof(checkerFunction) != "function") {
                let argFlag = false;
                let argError;
                for (const argType of checkerFunction){
                    argError = argType(words)
                    if (argError == -1) {
                        argFlag = true;
                        break
                    }
                }
                if (argFlag == false) argumentErrorHandler(argError, lineNumberTable[lineCount]);
            } else {
                const checkStatus = checkerFunction(words);
                if (checkStatus != -1) {
                    argumentErrorHandler(checkStatus, lineNumberTable[lineCount]);
                }
            }
            parserDebugTable.push(`${words[0]}, ${words[1]}, ${words[2]}, ${words[3]}`);
            switch (words[0]){
                case "CLS":
                    finalRom[addr] = 0x00;
                    finalRom[addr+1] = 0xE0;
                    break;
                case "RET":
                    finalRom[addr] = 0x00;
                    finalRom[addr+1] = 0xEE;
                    break;
                case "SYS":
                    let sysAddr = +words[1]
                    if (!isNaN(sysAddr)) {
                        finalRom[addr] = 0x00 | (sysAddr >> 8);
                        finalRom[addr+1] = sysAddr & 0xFF;
                    } else {
                        labelRequestTable.push([addr, words[1], lineCount]);
                        finalRom[addr] = 0x00;
                    }
                    break;
                case "JP":
                    if (words[3] == 0) {
                        if (!isNaN(+words[1])) {
                            finalRom[addr] = 0x10 | (+words[1] >> 8);
                            finalRom[addr+1] = +words[1] & 0xFF;
                        } else {
                            labelRequestTable.push([addr, words[1], lineCount]);
                            finalRom[addr] = 0x10;
                        }
                    } else {
                        if (!isNaN(+words[2])) {
                            finalRom[addr] = 0xB0 | (+words[2] >> 8);
                            finalRom[addr+1] = +words[2] & 0xFF;
                        } else {
                            labelRequestTable.push([addr, words[2], lineCount]);
                            finalRom[addr] = 0xB0;
                        }
                    }
                    break;
                case "CALL":
                    let callAddr = +words[1]
                    if (!isNaN(callAddr)) {
                        finalRom[addr] = 0x20 | (callAddr >> 8);
                        finalRom[addr+1] = callAddr & 0xFF;
                    } else {
                        labelRequestTable.push([addr, words[1], lineCount]);
                        finalRom[addr] = 0x20;
                    }
                    break;
                case "SE":
                    finalRom[addr] = words[1];
                    finalRom[addr+1] = words[2];
                    break;
                case "SNE":
                    finalRom[addr] = words[1];
                    finalRom[addr+1] = words[2];
                    break;
                case "LD":
                    if (words[3] == 1) {
                        let ldAddr = +words[2]
                        if (!isNaN(ldAddr)) {
                            finalRom[addr] = 0xA0 | (ldAddr >> 8);
                            finalRom[addr+1] = ldAddr & 0xFF;
                        } else {
                            labelRequestTable.push([addr, words[2], lineCount]);
                            finalRom[addr] = 0xA0;
                        }
                    } else {
                        finalRom[addr] = words[1];
                        finalRom[addr+1] = words[2];
                    }
                    break;
                case "ADD":
                    finalRom[addr] = words[1];
                    finalRom[addr+1] = words[2];
                    break;
                case "OR":
                    finalRom[addr] = 0x80 | words[1];
                    finalRom[addr+1] = 0x01 | (words[2] << 4);
                    break;
                case "AND":
                    finalRom[addr] = 0x80 | words[1];
                    finalRom[addr+1] = 0x02 | (words[2] << 4);
                    break;
                case "XOR":
                    finalRom[addr] = 0x80 | words[1];
                    finalRom[addr+1] = 0x03 | (words[2] << 4);
                    break;
                case "SUB":
                    finalRom[addr] = 0x80 | words[1];
                    finalRom[addr+1] = 0x05 | (words[2] << 4);
                    break;
                case "SHR":
                    finalRom[addr] = 0x80 | words[1];
                    if (words[2] == undefined) words[2] == 0;
                    finalRom[addr+1] = 0x06 | (words[2] << 4);
                    break;
                case "SUBN":
                    finalRom[addr] = 0x80 | words[1];
                    finalRom[addr+1] = 0x07 | (words[2] << 4);
                    break;
                case "SHL":
                    finalRom[addr] = 0x80 | words[1];
                    if (words[2] == undefined) words[2] == 0;
                    finalRom[addr+1] = 0x0E | (words[2] << 4);
                    break;
                case "RND":
                    finalRom[addr] = 0xC0 | words[1];
                    finalRom[addr+1] = words[2];
                    break;
                case "DRW":
                    finalRom[addr] = 0xD0 | words[1];
                    finalRom[addr+1] = (words[2] << 4) | words[3];
                    break;
                case "SKP":
                    finalRom[addr] = 0xE0 | words[1];
                    finalRom[addr+1] = 0x9E;
                    break;
                case "SKPN":
                    finalRom[addr] = 0xE0 | words[1];
                    finalRom[addr+1] = 0xA1;
                    break;
                default:
                    throw new Error(`Critical Assembler Error, in line ${lineNumberTable[lineCount]}, invalid instruction made it past the checker!`);
            }
            addr += 2;
        }
        lineCount++;
    }
    for (const request of labelRequestTable) {
        if (labelTable[request[1]] == undefined) {
            throw new Error(`Label Error, no such label as ${request[1]} on line ${lineNumberTable[request[2]]}`)
        }
        finalRom[request[0]] |= (labelTable[request[1]] >> 8);
        finalRom[request[0]+1] = 0xFF & labelTable[request[1]];
    }
    console.log(ASM.split("\n"))
    console.log(cleanLines)
    console.log(parserDebugTable)
    console.log(finalRom)
    console.log(labelTable)
    console.log(lineNumberTable)
}