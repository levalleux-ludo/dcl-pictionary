//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { IDCLPictionaryNFT } from './IDCLPictionaryNFT.sol';

contract DCLPictionaryNFT is ERC721, Ownable, IDCLPictionaryNFT {
    
    constructor() ERC721("DCLPictionary", "DCLPCT") Ownable() {
    }

    /**
    * @dev Safely mints tokenId and transfers it to to.
    *
    * Requirements:
    *
    * - tokenId must not exist
    */
    function safeMint(address to, uint256 tokenId) external override onlyOwner {
        _safeMint(to, tokenId);
    }

    /**
     * @dev Sets `_tokenURI` as the tokenURI of `tokenId`.
     *
     * Requirements:
     *
     * - `tokenId` must exist.
     */
    function setTokenURI(uint256 tokenId, string memory _tokenURI) external override onlyOwner {
        _setTokenURI(tokenId, _tokenURI);
    }

    /**
     * @dev set the base URI for all token IDs. It is
     * automatically added as a prefix to the value returned in {tokenURI},
     * or to the token ID if {tokenURI} is empty.
     */
    function setBaseURI(string memory baseURI_) external override onlyOwner {
        _setBaseURI(baseURI_);
    }

    function exists(uint256 tokenId) external override view returns (bool) {
        return _exists(tokenId);
    }



}