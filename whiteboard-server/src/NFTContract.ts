import { NFT_CONTRACT } from './config';
import { web3Provider } from './web3';
import nftAbi from '../../scene/contracts/DCLPictionaryNFT';
import { ethers } from 'ethers';

class NFTContract {
    contract: ethers.Contract;
    constructor() {
        this.contract = web3Provider.getContract(NFT_CONTRACT, nftAbi);
    }
    public async balanceOf(user: string): Promise<ethers.BigNumber> {
        await this.contract.deployed();
        return this.contract.balanceOf(user);
    }
}

export const nFTContract = new NFTContract();