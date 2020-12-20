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
export const IMAGE_SERVER_URL = 'https://pictionary.levalleux.online/NFT/images';
export const METADATA_STORE = process.env.STORE + '/NFT';
export const METADATA_SERVER_URL = 'https://pictionary.levalleux.online/NFT';
export const WEB3_NETWORK = {
    chainId: 80001,
    name: 'Mumbai',
    nodeUrl: 'https://rpc-mumbai.maticvigil.com'
};
export const PCT_CONTRACT = '0x875F95a42F058Ba21C3d33Bcc184949238643060';
export const NFT_CONTRACT = '0x3818a45ca7754Ddbf47fB2aA39F34517C8ccF0a7';

// export const WEB3_NETWORK = {
//     chainId: 1337,
//     name: 'Ganache',
//     nodeUrl: 'http://192.168.1.11:7545'
// };
// export const PCT_CONTRACT = '0xf0D06B335fcDcF59eb602DeECBc4Dd54A64eBF8b';
// export const NFT_CONTRACT = '0x23699D88166B5b5CC4F3a9D1c2fF6D3D59127a52';
export const GUESSING_TIMEOUT = 45000;
