const stellar = require('@stellar/stellar-sdk');
console.log('--- SDK Exports ---');
console.log(Object.keys(stellar).filter(k => k.includes('Liquidity')));
console.log('-------------------');
