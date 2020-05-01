import diffImage from '../src';

console.log('START');

diffImage('./test/testdata/1/before.png', './test/testdata/1/after.png', 'result.png').then(() => {
    console.log('END');
});
