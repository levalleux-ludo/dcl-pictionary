//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IDCLPictionaryNFT is IERC721, IERC721Metadata, IERC721Enumerable {
    
    function safeMint(address to, uint256 tokenId) external;
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external;
    function setBaseURI(string memory baseURI_) external;
    function exists(uint256 tokenId) external view returns (bool);

}