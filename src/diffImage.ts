import DiffMatchPatch from 'diff-match-patch';
import Jimp from 'jimp';

function diffLineMode(text1, text2) {
    let dmp = new DiffMatchPatch();
    let a = dmp.diff_linesToChars_(text1, text2);
    let lineText1 = a.chars1;
    let lineText2 = a.chars2;
    let lineArray = a.lineArray;
    let diffs = dmp.diff_main(lineText1, lineText2, false);
    dmp.diff_charsToLines_(diffs, lineArray);
    return diffs;
}

type ImageSource = string | Jimp | Buffer;
export async function diffImage(imageSource1: ImageSource, imageSource2: ImageSource, outPath: string = null) {
    let jimp = await Jimp.read(<any>imageSource1);
    let { data, width, height } = jimp.bitmap;

    let hexLines: Array<Array<string>> = [];
    for (let { y, idx } of jimp.scanIterator(0, 0, width, height)) {
        let hexLine: Array<string> = hexLines[y] || [];

        for (let i = 0; i <= 3; i++) {
            let hex = data[idx + i].toString(16);
            hexLine.push(hex);
        }

        hexLines[y] = hexLine;
    }

    if (outPath === null) {
        return new Buffer('', 'utf8');
    }
}
