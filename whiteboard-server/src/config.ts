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
  
export const WHITEBOARD_APP_URL = 'http://192.168.1.11:4200';
export const IMAGE_STORE = 'E:/temp/NFT/images';
export const IMAGE_SERVER_URL = 'https://pictionary.levalleux.online/NFT/images';
export const METADATA_STORE = 'E:/temp/NFT';
export const METADATA_SERVER_URL = 'https://pictionary.levalleux.online/NFT';
export const WEB3_NETWORK = {
    chainId: 80001,
    name: 'Mumbai',
    nodeUrl: 'https://rpc-mumbai.maticvigil.com'
};
export const PCT_CONTRACT = '0x1B1029C79dcf5aAA973b00eE71BcB7184EfC02F5';
export const NFT_CONTRACT = '0x1F1409978E4c1D9Cc6c7A8F1513F924d15bf2b41';

// export const WEB3_NETWORK = {
//     chainId: 1337,
//     name: 'Ganache',
//     nodeUrl: 'http://127.0.0.1:7545'
// };
// export const PCT_CONTRACT = '0xe2A2fb306908Fa3fCC8D94EF87Ea9d4CB59CFD78';
// export const NFT_CONTRACT = '0xAeb2E5FA33AE4b92715Cb7Ea8d00854C5C040E14';