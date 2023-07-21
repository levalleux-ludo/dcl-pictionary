import { PCT_CONTRACT } from './config';
import { web3Provider } from './web3';
import pctAbi from '../../scene/contracts/DCLPictionary';
import { ethers } from 'ethers';

class PCTContract {
    contract: ethers.Contract;
    constructor() {
        this.contract = web3Provider.getSignedContract(PCT_CONTRACT, pctAbi);
    }
    public async prepareNFT(winner: string, tokenId: string, tokenURI: string) {
        await this.contract.deployed();
        return new Promise<void>((resolve, reject) => {
            this.contract.prepareNFT(winner, tokenId, tokenURI).then((response: any) => {
                console.log('called prepareNFT for token', tokenId);
                response.wait().then((result: any) => {
                    console.log('Completed prepareNFT for token', tokenId);
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }

    public async metaClaimNFT(tokenId: string, signerAddress: string, functionSignature: string, sigR: string, sigS: string, sigV: string)
    {
        await this.contract.deployed();
        return new Promise<void>((resolve, reject) => {
            this.contract.metaClaimNFT(tokenId, signerAddress, functionSignature, sigR, sigS, sigV).then((response: any) => {
                console.log('called metaClaimNFT for token', tokenId);
                response.wait().then((result: any) => {
                    console.log('Completed metaClaimNFT for token', tokenId);
                    resolve();
                }).catch(reject);
            }).catch(reject);
        });
    }
}

export const pCTContract = new PCTContract();