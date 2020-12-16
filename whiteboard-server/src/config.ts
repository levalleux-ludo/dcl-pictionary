import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
const res = dotenvConfig({
    debug: true,
    path: resolve(__dirname, './../.env'),
  });
  if (res.error) {
    throw res.error;
  }
  
if (!process.env.MNEMONIC) {
    throw new Error('Please set your MNEMONIC in a .env file');
}
  
export const WHITEBOARD_APP_URL = process.env.APP_URL;
export const IMAGE_STORE = process.env.STORE + '/NFT/images';
export const IMAGE_SERVER_URL = 'E:/temp/NFT/images';
export const METADATA_STORE = process.env.STORE + '/NFT';
export const METADATA_SERVER_URL = 'E:/temp/NFT';
// export const WEB3_NETWORK = {
//     chainId: 80001,
//     name: 'Mumbai',
//     nodeUrl: 'https://rpc-mumbai.maticvigil.com'
// };
// export const PCT_CONTRACT = '0x1B1029C79dcf5aAA973b00eE71BcB7184EfC02F5';
// export const NFT_CONTRACT = '0x1F1409978E4c1D9Cc6c7A8F1513F924d15bf2b41';

export const WEB3_NETWORK = {
    chainId: 1337,
    name: 'Ganache',
    nodeUrl: 'http://192.168.1.11:7545'
};
export const PCT_CONTRACT = '0xf0D06B335fcDcF59eb602DeECBc4Dd54A64eBF8b';
export const NFT_CONTRACT = '0x23699D88166B5b5CC4F3a9D1c2fF6D3D59127a52';