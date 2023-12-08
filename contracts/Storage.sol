pragma solidity 0.6.2;

import "./Libraries/Counters.sol";
    
contract Storage {
    using Counters for Counters.Counter;

    // Token name
    string internal _name;
    // Token symbol
    string internal _symbol;
    // Token base uri
    string internal _baseTokenURI;

    // ERC165 supported interfaces
    bytes4 internal constant _INTERFACE_ID_ERC165 = 0x01ffc9a7;
    bytes4 internal constant _ERC721_RECEIVED = 0x150b7a02;
    bytes4 internal constant _INTERFACE_ID_ERC721 = 0x80ac58cd;
    bytes4 internal constant _INTERFACE_ID_ERC721_ENUMERABLE = 0x780e9d63;
    bytes4 internal constant _INTERFACE_ID_ERC721_METADATA = 0x5b5e139f;
    
    // OpenSea proxy registry
    address public proxyRegistryAddress;

    // token id tracker
    uint256 internal _currentTokenId = 0;
    
    // Array with all token ids, used for enumeration
    uint256[] internal _allTokens;

    // mapping of interface id to whether or not it's supported    
    mapping(bytes4 => bool) internal _supportedInterfaces;

    // Mapping from token ID to owner
    mapping (uint256 => address) internal _tokenOwner;

    // Mapping from token ID to approved address
    mapping (uint256 => address) internal _tokenApprovals;

    // Mapping from owner to number of owned token
    mapping (address => Counters.Counter) internal _ownedTokensCount;

    // Mapping from owner to operator approvals
    mapping (address => mapping (address => bool)) internal _operatorApprovals;

    // Optional mapping for token URIs
    mapping(uint256 => string) internal _tokenURIs;

    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) internal _ownedTokens;

    // Mapping from token ID to index of the owner tokens list
    mapping(uint256 => uint256) internal _ownedTokensIndex;

    // Mapping from token id to position in the allTokens array
    mapping(uint256 => uint256) internal _allTokensIndex;

    
}