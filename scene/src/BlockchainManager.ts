import { NFT_CONTRACT, PCT_CONTRACT, L2_NETWORK } from './Constants';
import * as EthereumController from "@decentraland/EthereumController"; 
import { getProvider } from "@decentraland/web3-provider"
import * as EthConnect from "eth-connect";

import nftAbi from '../contracts/DCLPictionaryNFT';
import pctAbi from '../contracts/DCLPictionary';
import { getUserAccount, RPCSendableMessage } from '@decentraland/EthereumController';
import { BigNumber, Contract, isBigNumber } from 'eth-connect';
import { padStart } from './Utils';
import { whiteboardClient } from './whiteboard-client';

class BlockchainManager {

    l2RequestManager;
    public constructor() {
      this.l2RequestManager = new EthConnect.RequestManager(new EthConnect.HTTPProvider(L2_NETWORK.rpcNode));
    }

    private getDomainData(network: string, chainId: string) {
      const domainData: any = {
        name: 'DCL-Pictionary',
        version: '1',
        verifyingContract: PCT_CONTRACT
      }
      const domainType = [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "verifyingContract", type: "address" }
      ]
      return [domainData, domainType]
    }
    

    private async buildMetaTx(tokenId: string, contract: Contract, fromAddress: string): Promise<any[]> {
      const provider = await getProvider()
      const metamaskRM = new EthConnect.RequestManager(provider)

      let chainId = await (contract as any).getChainId();

      log('chainId:', chainId.toString());

      const [domainData, domainType] = this.getDomainData('mumbai', chainId.toString());

      const metaTransactionType = [
        { name: 'nonce', type: 'uint256' },
        { name: 'from', type: 'address' },
        { name: 'functionSignature', type: 'bytes' }
      ];

      const tokenInt = +tokenId;

      const functionSignature = `0xfe5c873a00000000000000000000000000000000000000000000000000000000${
        padStart(tokenInt.toString(16), 8, '0')
      }`;

      let nonce = await (contract as any).getNonce(fromAddress);

      let message = {
        nonce: nonce,
        from: fromAddress,
        functionSignature: functionSignature
      }

      const dataToSign = JSON.stringify({
        types: {
          EIP712Domain: domainType,
          MetaTransaction: metaTransactionType
        },
        domain: domainData,
        primaryType: 'MetaTransaction',
        message: message
      })

      log('dataToSign', JSON.stringify(dataToSign));

      return new Promise((resolve, reject) => {
        metamaskRM.provider.sendAsync(
          {
            method: 'eth_signTypedData_v4',
            params: [fromAddress, dataToSign],
            jsonrpc: '2.0',
            id: 999999999999
          } as RPCSendableMessage,
          async (err: any, result: any) => {
            if (err) {
              reject(err)
              return error(err)
            }
            const signature = result.result.substring(2)
            const sigR = '0x' + signature.substring(0, 64)
            const sigS = '0x' + signature.substring(64, 128)
            const sigV = '0x' + signature.substring(128, 130)
  
            resolve([fromAddress, {functionSignature, r: sigR, s: sigS, v: sigV}])
          })
      })

    }

    public async claimNFT2(tokenId: string) {
      try {
          const factory = new EthConnect.ContractFactory(this.l2RequestManager, pctAbi)
          const contract = (await factory.at(
            PCT_CONTRACT
          )) as any
          const address = await getUserAccount()

            this.buildMetaTx(tokenId, contract, address).then(([fromAddress, signature]) => {
              log('Meta Tx built', fromAddress, JSON.stringify(signature));
              whiteboardClient.claimNFT(tokenId, address, signature).then(() => {
                log('claim successfully called')
              }).catch(e => {
                log('claim calling failed', e);
              })
            })
      
        } catch (error) {
          log('blockchainManager' + error.toString())
        }
    }


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
            log('claimNFT', 'tokenId', tokenId);
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
            // const provider = await getProvider()
            // const requestManager = new EthConnect.RequestManager(provider)
            
            const factory = new EthConnect.ContractFactory(this.l2RequestManager, nftAbi)
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