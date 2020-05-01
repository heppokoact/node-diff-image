import DiffMatchPatch from 'diff-match-patch';
import Jimp from 'jimp';

type Diff = [number, string];
type ImageSource = string | Jimp | Buffer;

export default async function diffImage(imageSource1: ImageSource, imageSource2: ImageSource, outPath?: string) {
    let jimp1 = await Jimp.read(<any>imageSource1);
    let jimp2 = await Jimp.read(<any>imageSource2);

    let hexLines1 = encodeToHexString(jimp1);
    let hexLines2 = encodeToHexString(jimp2);
    let diffs = diffLineMode(hexLines1, hexLines2);
    let newImage = makeNewImage(diffs, jimp1.bitmap.width);

    if (outPath !== undefined) {
        await newImage.write(outPath);
    }
    return newImage;
}

function makeNewImage(diffs: Array<Diff>, width: number) {
    let newImage = new Jimp(width, diffs.length);
    let red = new Jimp(width, 1, 0xff0000ff);
    let green = new Jimp(width, 1, 0x00ff00ff);

    diffs.forEach((diff, y) => {
        let pixels = decodeHexLine(diff[1]);
        pixels.forEach((pixel, x) => newImage.setPixelColor(pixel, x, y));

        if (diff[0] !== 0) {
            let overlay = diff[0] === 1 ? green : red;
            newImage.composite(overlay, 0, y, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 0.2,
                opacityDest: 1.0,
            });
        }
    });

    return newImage;
}

function decodeHexLine(line: string) {
    return (line.match(/.{8}/g) || []).map(Jimp.cssColorToHex);
}

function diffLineMode(text1: string, text2: string): Array<Diff> {
    let dmp = new DiffMatchPatch();
    let a = dmp.diff_linesToChars_(text1, text2);
    let lineText1 = a.chars1;
    let lineText2 = a.chars2;
    let lineArray = a.lineArray;
    let diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return disassembleDiffs(diffs);
}

function disassembleDiffs(diffs: Array<Diff>) {
    return diffs.reduce((disassembled, diff) => {
        diff[1].split('\n').forEach(line => {
            disassembled.push([diff[0], line]);
        });
        return disassembled;
    }, new Array<Diff>());
}

function encodeToHexString(jimp: Jimp) {
    let { data, width, height } = jimp.bitmap;

    let hexes: Array<Array<string>> = [];
    for (let { y, idx } of jimp.scanIterator(0, 0, width, height)) {
        let hexLine: Array<string> = hexes[y] || [];

        for (let i = 0; i <= 3; i++) {
            let hex = data[idx + i].toString(16).padStart(2, '0');
            hexLine.push(hex);
        }

        hexes[y] = hexLine;
    }

    let hexLines = hexes.map(hexArray => hexArray.join(''));
    return hexLines.join('\n');
}
