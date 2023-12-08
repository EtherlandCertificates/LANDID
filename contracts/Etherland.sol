// SPDX-License-Identifier: UNLICENSED
/**
 * @author Mathieu Lecoq
 * september 3rd 2020 
 *
 * @dev Property
 * all rights are reserved to EtherLand ltd
 *
 * @dev deployed with compiler version 0.6.2
 */
pragma solidity 0.6.2;

import "./TradeableERC721Token.sol";
import "./IpfsHashs.sol";
import "./ERC1822/Proxiable.sol";

/**
* @title Etherland NFT Assets
*/
contract Etherland is TradeableERC721Token, IpfsHashs, Proxiable {
    /**
    * @dev initialized state MUST remain set to false on Implementation Contract 
    */
    bool public initialized = false;

    /**
    * @dev event emitting when the `_baseTokenUri` is updated by owner
    */
    event BaseTokenUriUpdated(string newUri);

    /**
    * @dev Logic code implementation contact constructor
    * @dev MUST be called by deployer only if contract has not been initialized before
    */
    function init(
        string memory _name,
        string memory _symbol,
        address _proxyRegistryAddress,
        string memory baseURI,
        address _owner
    ) public {
        if (initialized != true) {
            initialized = true;

            TradeableERC721Token.init(_name, _symbol, _proxyRegistryAddress);

            _baseTokenURI = baseURI;

            // register the supported interfaces to conform to ERC721 via ERC165
            _registerInterface(_INTERFACE_ID_ERC165);
            _registerInterface(_INTERFACE_ID_ERC721_METADATA);
            _registerInterface(_INTERFACE_ID_ERC721_ENUMERABLE);
            _registerInterface(_INTERFACE_ID_ERC721);

            _transferOwnership(_owner);
        }
    }

    /**
    * @dev Retrieve all NFTs base token uri 
    */
    function baseTokenURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    /**
    * @dev Set the base token uri for all NFTs
    */
    function setBaseTokenURI(string memory uri) public onlyOwner {
        _baseTokenURI = uri;
        emit BaseTokenUriUpdated(uri);
    }

    /**
    * @dev Retrieve the uri of a specific token 
    * @param _tokenId the id of the token to retrieve the uri of
    * @return computed uri string pointing to a specific _tokenId
    */
    function tokenURI(uint256 _tokenId) external view returns (string memory) {
        return Strings.strConcat(
            baseTokenURI(),
            Strings.uint2str(_tokenId)
        );
    }

    /**
    * @dev EIP-1822 feature
    * @dev Realize an update of the Etherland logic code 
    * @dev calls the proxy contract to update stored logic code contract address at keccak256("PROXIABLE")
    */
    function updateCode(address newCode) public onlyOwner {
        updateCodeAddress(newCode);
    }

    /**
    * @dev Mint a new token with document hash corresponding to an IPFS CID
    * @param _to address of the future owner of the token
    * @param docType string representing the type of document that is stored to IPFS (can be "pdf" or any other token related document)
    * @param _hash string representing the hash of a document with type equals to `docType`
    */
    function mintWithIpfsHash(address _to, string memory docType, string memory _hash) public onlyMinter {
        mintTo(_to);
        setIpfsHash(_currentTokenId, docType, _hash);
    }

}
