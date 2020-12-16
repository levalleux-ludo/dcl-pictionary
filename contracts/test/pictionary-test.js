const { expect } = require("chai");
const { ethers } = require("hardhat");
const sigUtils = require('eth-sig-util')
const { TypedDataUtils } = require('ethers-eip712');


let nft;
let owner;
let ownerAddress;
let user1;
let user1Address;
let user2;
let user2Address;
let wallet;
let chainId = ethers.BigNumber.from(12345);
const tokenId = ethers.BigNumber.from(12);
const tokenURI = 'http://myTokens.mySite.com/' + tokenId.toString();

describe("DCLPictionaryNFT", function() {
    before('before tests', async() => {
        [owner, user1, user2] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        user1Address = await user1.getAddress();
        user2Address = await user2.getAddress();
    });
    it("create the contract", async function() {
        const DCLPictionaryNFT = await ethers.getContractFactory("DCLPictionaryNFT");
        nft = await DCLPictionaryNFT.deploy();
        await nft.deployed();
        expect((await nft.totalSupply()).toString()).to.equal('0');
    });
    it('mint a token', async function() {
        await nft.connect(owner).safeMint(user1Address, tokenId);
        expect((await nft.totalSupply()).toString()).to.equal('1');
    });
    it('check balance', async() => {
        const balance1 = await nft.balanceOf(user1Address);
        expect(balance1.toString()).to.equal('1');
        const balance2 = await nft.balanceOf(user2Address);
        expect(balance2.toString()).to.equal('0');
    })
});

describe('DCLPictionary', () => {
    before('before tests', async() => {
        [owner, user1, user2] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        user1Address = await user1.getAddress();
        user2Address = await user2.getAddress();
    });
    it("create the contract", async function() {
        const DCLPictionaryNFT = await ethers.getContractFactory("DCLPictionaryNFT");
        nft = await DCLPictionaryNFT.deploy();
        await nft.deployed();
        const DCLPictionary = await ethers.getContractFactory('DCLPictionary');
        pct = await DCLPictionary.deploy(chainId);
        await pct.deployed();
        await nft.connect(owner).transferOwnership(pct.address);
        await pct.setNFTContract(nft.address);
        expect(await nft.exists(tokenId)).to.equal(false);
        expect(await pct.nftAddress()).to.equal(nft.address);
    });
    it('prepare the token', async() => {
        await pct.connect(owner).prepareNFT(user2Address, tokenId, tokenURI);
    });
    it('claim token', async() => {
        await pct.connect(user2).claimNFT(tokenId);
    })
    it('check balance', async() => {
        const balance1 = await nft.balanceOf(user1Address);
        expect(balance1.toString()).to.equal('0');
        const balance2 = await nft.balanceOf(user2Address);
        expect(balance2.toString()).to.equal('1');
    })

})

describe('claimNFT with meta transaction', () => {
    before('before tests', async() => {
        [owner, user1, user2] = await ethers.getSigners();
        ownerAddress = await owner.getAddress();
        console.log('ownerAddress', ownerAddress);
        user1Address = await user1.getAddress();
        console.log('user1Address', user1Address);
        user2Address = await user2.getAddress();
        console.log('user2Address', user2Address);
        const DCLPictionaryNFT = await ethers.getContractFactory("DCLPictionaryNFT");
        nft = await DCLPictionaryNFT.deploy();
        await nft.deployed();
        const DCLPictionary = await ethers.getContractFactory('DCLPictionary');
        pct = await DCLPictionary.deploy(chainId);
        await pct.deployed();
        await nft.connect(owner).transferOwnership(pct.address);
        await pct.setNFTContract(nft.address);
        wallet = ethers.Wallet.createRandom();
    });
    it('prepare the token', async() => {
        await pct.connect(owner).prepareNFT(wallet.address, tokenId, tokenURI);
    });
    it('metaClaim', async() => {
        console.log('wallet', wallet.publicKey, wallet.address, wallet.privateKey);
        const verifyingContract = pct.address;
        const fromAddress = wallet.address;
        const nonce = await pct.getNonce(fromAddress);
        // const chainId = await pct.getChainId();
        console.log('chainId:', chainId.toString());
        const tokenHex = padString(tokenId.toNumber().toString(16), 8, '0');
        const dataToSign = JSON.parse(`{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"MetaTransaction":[{"name":"nonce","type":"uint256"},{"name":"from","type":"address"},{"name":"functionSignature","type":"bytes"}]},"domain":{"name":"DCL-Pictionary","version":"1","chainId":"${chainId.toString()}","verifyingContract":"${verifyingContract}"},"primaryType":"MetaTransaction","message":{"nonce":"${nonce}","from":"${fromAddress}","functionSignature":"0xfe5c873a00000000000000000000000000000000000000000000000000000000${tokenHex}"}}`);

        console.log('dataToSign', dataToSign);
        const digest = TypedDataUtils.encodeDigest(dataToSign)
        const digestHex = ethers.utils.hexlify(digest)
        const signature = await wallet._signTypedData(dataToSign.domain, { MetaTransaction: dataToSign.types.MetaTransaction }, dataToSign.message);
        console.log('signature', signature);
        const { r, s, v } = getSignatureParameters(signature)
        console.log('r', r, 's', s, 'v', v);

        const foundKey = ethers.utils.recoverAddress(digestHex, { r, s, v });
        console.log('foundKey', foundKey);
        expect(foundKey).to.equal(fromAddress);
        await pct.metaClaimNFT(tokenId, fromAddress, dataToSign.message.functionSignature, r, s, v);
        const balanceNFT = await nft.balanceOf(fromAddress);
        expect(balanceNFT.toString()).to.equal('1');
    });
})

function padString(str, length, char) {
    let strOut = str;
    while (strOut.length < length) {
        strOut = char + strOut;
    }
    return strOut;
}


const getSignatureParameters = (signature) => {
    const r = signature.slice(0, 66)
    const s = '0x'.concat(signature.slice(66, 130))
    const _v = '0x'.concat(signature.slice(130, 132))
    let v = parseInt(_v)
    if (![27, 28].includes(v)) v += 27
    return { r, s, v }
}