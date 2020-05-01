"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const diff_match_patch_1 = __importDefault(require("diff-match-patch"));
const jimp_1 = __importDefault(require("jimp"));
async function diffImage(imageSource1, imageSource2, outPath) {
    let jimp1 = await jimp_1.default.read(imageSource1);
    let jimp2 = await jimp_1.default.read(imageSource2);
    let hexLines1 = encodeToHexString(jimp1);
    let hexLines2 = encodeToHexString(jimp2);
    let diffs = diffLineMode(hexLines1, hexLines2);
    let newImage = makeNewImage(diffs, jimp1.bitmap.width);
    if (outPath !== undefined) {
        await newImage.write(outPath);
    }
    return newImage;
}
exports.default = diffImage;
function makeNewImage(diffs, width) {
    let newImage = new jimp_1.default(width, diffs.length);
    let red = new jimp_1.default(width, 1, 0xff0000ff);
    let green = new jimp_1.default(width, 1, 0x00ff00ff);
    diffs.forEach((diff, y) => {
        let pixels = decodeHexLine(diff[1]);
        pixels.forEach((pixel, x) => newImage.setPixelColor(pixel, x, y));
        if (diff[0] !== 0) {
            let overlay = diff[0] === 1 ? green : red;
            newImage.composite(overlay, 0, y, {
                mode: jimp_1.default.BLEND_SOURCE_OVER,
                opacitySource: 0.2,
                opacityDest: 1.0,
            });
        }
    });
    return newImage;
}
function decodeHexLine(line) {
    return (line.match(/.{8}/g) || []).map(jimp_1.default.cssColorToHex);
}
function diffLineMode(text1, text2) {
    let dmp = new diff_match_patch_1.default();
    let a = dmp.diff_linesToChars_(text1, text2);
    let lineText1 = a.chars1;
    let lineText2 = a.chars2;
    let lineArray = a.lineArray;
    let diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return disassembleDiffs(diffs);
}
function disassembleDiffs(diffs) {
    return diffs.reduce((disassembled, diff) => {
        diff[1].split('\n').forEach(line => {
            disassembled.push([diff[0], line]);
        });
        return disassembled;
    }, new Array());
}
function encodeToHexString(jimp) {
    let { data, width, height } = jimp.bitmap;
    let hexes = [];
    for (let { y, idx } of jimp.scanIterator(0, 0, width, height)) {
        let hexLine = hexes[y] || [];
        for (let i = 0; i <= 3; i++) {
            let hex = data[idx + i].toString(16).padStart(2, '0');
            hexLine.push(hex);
        }
        hexes[y] = hexLine;
    }
    let hexLines = hexes.map(hexArray => hexArray.join(''));
    return hexLines.join('\n');
}
//# sourceMappingURL=index.js.map