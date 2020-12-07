//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import  { IDCLPictionaryNFT } from './IDCLPictionaryNFT.sol';

contract DCLPictionary is Ownable {
    struct TokenData {
        address winner;
        string tokenURI;
    }
    address public nftAddress;
    mapping(uint256 => TokenData) tokenDatas;

    constructor() Ownable() {}

    function setNFTContract(address _nftAddress) external onlyOwner {
        require(Ownable(_nftAddress).owner() == address(this), "CONTRACT_MUST_OWNS_NFT_CONTRACT");
        nftAddress = _nftAddress;
    }

    function prepareNFT(address winner, uint256 tokenId, string memory tokenURI) external onlyOwner {
        require(nftAddress != address(0), "NFT_CONTRACT_NOT_DEFINED");
        require(tokenDatas[tokenId].winner == address(0), "TOKEN_ALREADY_PREPARED");
        require(!IDCLPictionaryNFT(nftAddress).exists(tokenId), "TOKEN_ALREADY_EXISTS");
        tokenDatas[tokenId].winner = winner;
        tokenDatas[tokenId].tokenURI = tokenURI;
    }

    function claimNFT(uint256 tokenId) external {
        require(nftAddress != address(0), "NFT_CONTRACT_NOT_DEFINED");
        require(tokenDatas[tokenId].winner != address(0), "NOT_PREPARED_TOKEN");
        require(tokenDatas[tokenId].winner == msg.sender, "NOT_AUTHORIZED");
        IDCLPictionaryNFT(nftAddress).safeMint(tokenDatas[tokenId].winner, tokenId);
        IDCLPictionaryNFT(nftAddress).setTokenURI(tokenId, tokenDatas[tokenId].tokenURI);
        delete tokenDatas[tokenId];
    }

}