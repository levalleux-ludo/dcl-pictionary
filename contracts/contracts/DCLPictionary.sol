//SPDX-License-Identifier: Unlicense
pragma solidity ^0.7.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

import  { IDCLPictionaryNFT } from './IDCLPictionaryNFT.sol';
import {EIP712Base} from "./EIP712Base.sol";

contract DCLPictionary is Ownable, EIP712Base {

    using SafeMath for uint256;

    /*
     * Meta transaction structure.
     * No point of including value field here as if user is doing value transfer then he has the funds to pay for gas
     * He should call the desired function directly in that case.
     */
    struct MetaTransaction {
        uint256 nonce;
        address from;
        bytes functionSignature;
    }
    struct TokenData {
        address winner;
        string tokenURI;
    }
    address public nftAddress;
    mapping(uint256 => TokenData) tokenDatas;
    bytes32 private constant META_TRANSACTION_TYPEHASH = keccak256(
        bytes(
            "MetaTransaction(uint256 nonce,address from,bytes functionSignature)"
        )
    );
    mapping(address => uint256) nonces;

    constructor(uint256 _chainId) Ownable() EIP712Base("DCL-Pictionary", _chainId) {
    }

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
        console.log("claimNFT");
        require(nftAddress != address(0), "NFT_CONTRACT_NOT_DEFINED");
        console.log("claimNFT nftAddress is OK");
        require(tokenDatas[tokenId].winner != address(0), "NOT_PREPARED_TOKEN");
        console.log("claimNFT tokenId is OK");
        require(tokenDatas[tokenId].winner == metaSender(), "NOT_AUTHORIZED");
        console.log("claimNFT sender is OK");
        IDCLPictionaryNFT(nftAddress).safeMint(tokenDatas[tokenId].winner, tokenId);
        IDCLPictionaryNFT(nftAddress).setTokenURI(tokenId, tokenDatas[tokenId].tokenURI);
        delete tokenDatas[tokenId];
    }

    function metaSender()
        internal
        view
        returns (address sender)
    {
        if (msg.sender == address(this)) {
            bytes memory array = msg.data;
            uint256 index = msg.data.length;
            assembly {
                // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
                sender := and(
                    mload(add(array, index)),
                    0xffffffffffffffffffffffffffffffffffffffff
                )
            }
        } else {
            sender = msg.sender;
        }
        return sender;
    }

    function metaClaimNFT(uint256 tokenId, address signer, bytes memory functionSignature, bytes32 sigR, bytes32 sigS, uint8 sigV) external onlyOwner returns (bytes memory) {
        MetaTransaction memory metaTx = MetaTransaction({
            nonce: nonces[signer],
            from: signer,
            functionSignature: functionSignature
        });
        require(
            verify(signer, metaTx, sigR, sigS, sigV),
            "Signer and signature do not match"
        );
        console.log("signature is verified");
        // increase nonce for user (to avoid re-use)
        nonces[signer] = nonces[signer].add(1);

        // Append userAddress and relayer address at the end to extract it from calling context
        (bool success, bytes memory returnData) = address(this).call(
            abi.encodePacked(functionSignature, signer)
        );
        require(success, "Function call not successful");

        return returnData;
    }

    function hashMetaTransaction(MetaTransaction memory metaTx)
        internal
        pure
        returns (bytes32)
    {
        return
            keccak256(
                abi.encode(
                    META_TRANSACTION_TYPEHASH,
                    metaTx.nonce,
                    metaTx.from,
                    keccak256(metaTx.functionSignature)
                )
            );
    }

    function getNonce(address user) public view returns (uint256 nonce) {
        nonce = nonces[user];
    }

    function verify(
        address signer,
        MetaTransaction memory metaTx,
        bytes32 sigR,
        bytes32 sigS,
        uint8 sigV
    ) internal view returns (bool) {
        require(signer != address(0), "NativeMetaTransaction: INVALID_SIGNER");
        console.log('metaTransaction: nonce', metaTx.nonce);
        console.log(metaTx.from);
        console.logBytes(metaTx.functionSignature);
        address recover = ecrecover(
                toTypedMessageHash(hashMetaTransaction(metaTx)),
                sigV,
                sigR,
                sigS
            );
        console.log('recover', recover);
        return (signer == recover);
    }

}