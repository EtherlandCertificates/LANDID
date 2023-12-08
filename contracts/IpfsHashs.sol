pragma solidity 0.6.2;

import "./Administrable.sol";

/**
* @title IpfsHashs
* @dev Provide methods to store and retrieve tokens IPFS CIDs
*/
contract IpfsHashs is Administrable {

    mapping (uint => mapping(string => string)) internal ipfsHashs;

    function setIpfsHash(uint tokenId, string memory docType, string memory _hash) public onlyMinter {
        require(tokenId > 0, "denied : token zero cant be used");
        ipfsHashs[tokenId][docType] = _hash;
    }

    function removeIpfsHash(uint tokenId, string memory docType) public onlyMinterBurner {
        ipfsHashs[tokenId][docType] = "";
    }

    function getIpfsHash(uint tokenId, string memory docType) public view returns (string memory) {
        return ipfsHashs[tokenId][docType];
    }

}