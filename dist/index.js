"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ffi_1 = __importDefault(require("ffi"));
const ref_struct_1 = __importDefault(require("ref-struct"));
const GoString = ref_struct_1.default({
    p: 'string',
    n: 'longlong',
});
function NewGoString(str) {
    return new GoString({ p: str, n: str.length });
}
const diffImage = ffi_1.default.Library(__dirname + '/lib/diffImage', {
    diffImage: ['void', [GoString, GoString, GoString]],
});
exports.default = (before, after, result) => {
    diffImage.diffImage(NewGoString(before), NewGoString(after), NewGoString(result));
};
//# sourceMappingURL=index.js.map