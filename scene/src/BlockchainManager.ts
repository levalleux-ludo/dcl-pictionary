import { NFT_CONTRACT, PCT_CONTRACT } from './Constants';
import * as EthereumController from "@decentraland/EthereumController";
import * as EthConnect from "../node_modules/eth-connect/esm";
import { getProvider } from "@decentraland/web3-provider"

import nftAbi from '../contracts/DCLPictionaryNFT';
import pctAbi from '../contracts/DCLPictionary';
import { getUserAccount } from '@decentraland/EthereumController';
import { BigNumber } from '../node_modules/eth-connect/eth-connect';

class BlockchainManager {

    public async claimNFT(tokenId: string) {
        try {
            // Setup steps explained in the section above
            const provider = await getProvider()
            const requestManager = new EthConnect.RequestManager(provider)
            const factory = new EthConnect.ContractFactory(requestManager, pctAbi)
            const contract = (await factory.at(
              PCT_CONTRACT
            )) as any
            const address = await getUserAccount()
        
            // Perform a function from the contract
            const res = await contract.claimNFT(
              tokenId,
              {
                from: address,
              }
            )
            // Log response
            log('blockchainManager' + res)
            this.getNFTBalance().then((balance: BigNumber) => {
                log('NFT balance after:', balance.toString());
            });
          } catch (error) {
            log('blockchainManager' + error.toString())
          }
    }

    public async getNFTBalance(): Promise<BigNumber> {
        try {
            // Setup steps explained in the section above
            const provider = await getProvider()
            const requestManager = new EthConnect.RequestManager(provider)
            const factory = new EthConnect.ContractFactory(requestManager, nftAbi)
            const contract = (await factory.at(
              NFT_CONTRACT
            )) as any
            const address = await getUserAccount()
            log(address)
        
            // Perform a function from the contract
            const res = await contract.balanceOf(
              address,
              {
                from: address,
              }
            )
            // Log response
            log('blockchainManager' + res)
            return res;
          } catch (error) {
            log('blockchainManager' + error.toString())
          }
    }
}

export const blockchainManager = new BlockchainManager();