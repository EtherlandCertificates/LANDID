pragma solidity 0.6.2;

import "./IERC165.sol";

/**
* @title ERC721 Non-Fungible Token Standard basic interface
* @dev see https://eips.ethereum.org/EIPS/eip-721
* @dev source : openzeppelin-solidity/contracts/token/ERC721/IERC721.sol
*/
interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);

    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);

    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    function transferFrom(address from, address to, uint256 tokenId) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;

    function safeTransferFromWithData(address from, address to, uint256 tokenId, bytes calldata data) external;
}