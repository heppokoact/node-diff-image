import ffi from 'ffi';
import Struct from 'ref-struct';

const GoString = Struct({
    p: 'string',
    n: 'longlong',
});
function NewGoString(str: string) {
    return new GoString({ p: str, n: str.length });
}

const diffImage = ffi.Library(__dirname + '/../lib/diffImage', {
    diffImage: ['void', [GoString, GoString, GoString]],
});

export default (before, after, result) => {
    diffImage.diffImage(NewGoString(before), NewGoString(after), NewGoString(result));
};
