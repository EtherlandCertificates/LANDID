pragma solidity 0.6.2;

import "./IERC721.sol";

/**
* @title ERC-721 Non-Fungible Token Standard, optional enumeration extension
* @dev See https://eips.ethereum.org/EIPS/eip-721
* @dev source : openzeppelin-solidity/contracts/token/ERC721/IERC721Full.sol
*/
interface IERC721Full is IERC721 {
    function totalSupply() external view returns (uint256);
    function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256 tokenId);
    function tokenByIndex(uint256 index) external view returns (uint256);
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
}