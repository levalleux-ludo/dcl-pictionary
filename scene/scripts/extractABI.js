const fs = require('fs');

const nftAbi = require('../../contracts/artifacts/contracts/DCLPictionaryNFT.sol/DCLPictionaryNFT.json');
const pctAbi = require('../../contracts/artifacts/contracts/DCLPictionary.sol/DCLPictionary.json');

// console.log(nftAbi.abi);

fs.writeFileSync('./contracts/DCLPictionaryNFT.ts', `export default ${JSON.stringify(nftAbi.abi)}`);
fs.writeFileSync('./contracts/DCLPictionary.ts', `export default ${JSON.stringify(pctAbi.abi)}`);