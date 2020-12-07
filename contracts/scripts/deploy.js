// We require the Hardhat Runtime Environment explicitly here. This is optional 
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const ethers = hre.ethers;
const { getBalanceAsNumber } = require('./utils');


async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contracts to deploy

    const [deployer, user1] = await ethers.getSigners();
    const balance_before = await deployer.getBalance();
    console.log('Deployer address', await deployer.getAddress(), 'balance', getBalanceAsNumber(balance_before, 18, 4));

    const DCLPictionaryNFT = await ethers.getContractFactory("DCLPictionaryNFT");
    console.log('Create the NFT contract');
    const nft = await DCLPictionaryNFT.deploy();
    await nft.deployed();
    console.log("DCLPictionaryNFT deployed to:", nft.address);
    console.log('Create the PCT contract');
    const DCLPictionary = await ethers.getContractFactory('DCLPictionary');
    const pct = await DCLPictionary.deploy();
    await pct.deployed();
    console.log("DCLPictionary deployed to:", pct.address);
    console.log('Transfer NFT contract ownership to PCT contract');
    const response1 = await nft.connect(deployer).transferOwnership(pct.address);
    await response1.wait();
    console.log('set NFT contract in PCT');
    const response2 = await pct.setNFTContract(nft.address);
    await response2.wait();

    const balance_after = await deployer.getBalance();
    console.log('Paid fees', getBalanceAsNumber(balance_before.sub(balance_after), 18, 4), 'new balance', getBalanceAsNumber(balance_after, 18, 4));

    const user1Addr = await user1.getAddress();
    let balance1 = await nft.balanceOf('0x6c94bdb560d7044c648efc6f39c9e86e3f66ec2b');
    console.log('NFT balance', balance1.toString());
    // await pct.prepareNFT()
}



// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });