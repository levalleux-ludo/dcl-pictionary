const { expect } = require("chai");
const { ethers } = require("hardhat");

let nft;
let owner;
let ownerAddress;
let user1;
let user1Address;
let user2;
let user2Address;
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
        pct = await DCLPictionary.deploy();
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