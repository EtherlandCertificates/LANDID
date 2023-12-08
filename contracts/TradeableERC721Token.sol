pragma solidity 0.6.2;

import "./ERC721Full.sol";
import "./Administrable.sol";
import "./Libraries/Strings.sol";
import "./ProxyRegistry.sol";

/**
* @title TradeableERC721Token
* ERC721 contract that whitelists a trading address, and has minting functionalities.
* @notice an external 'burn' function restricted to owner as been added
*/
contract TradeableERC721Token is ERC721Full, Administrable {
    using Strings for string;
    using SafeMath for uint256;

    function init(string memory _name, string memory _symbol, address _proxyRegistryAddress) internal {
        ERC721Full.init(_name, _symbol);
        proxyRegistryAddress = _proxyRegistryAddress;
    }

    /**
    * @dev Mints a token to an address.
    * @param _to address of the future owner of the token
    */
    function mintTo(address _to) public onlyMinter {
        require(_to != address(0), "cannot mint to address 0");
        uint256 newTokenId = _getNextTokenId();
        _mint(_to, newTokenId);
        _incrementTokenId();
    }

    /**
     * @dev Mint several tokens to an address.
     * @param _total total number of NFT to mint (reverts if <= 0)
     * @param _to default owner of the new created NFT (reverts if a zero address)
     */
    function batchMintTo(uint _total, address _to) public onlyMinter {
        require(_total > 0, "mint minimum 1 token");
        for (uint i = 0; i < _total; i++) mintTo(_to);
    }

    /**
    * @dev External Burn NFT method
    */
    function burn(uint _tokenId) public onlyMinterBurner {
        super._burn(_tokenId);
    }

    /**
        * @dev calculates the next token ID based on value of _currentTokenId
        * @return uint256 for the next token ID
        */
    function _getNextTokenId() private view returns (uint256) {
        return _currentTokenId.add(1);
    }

    /**
        * @dev increments the value of _currentTokenId
        */
    function _incrementTokenId() private  {
        _currentTokenId++;
    }

    /**
    * Override isApprovedForAll to whitelist user's OpenSea proxy accounts to enable gas-less listings.
    */
    function isApprovedForAll(
        address owner,
        address operator
    )
    public override
    view
    returns (bool)
    {
        // Whitelist OpenSea proxy contract for easy trading.
        ProxyRegistry proxyRegistry = ProxyRegistry(proxyRegistryAddress);
        if (address(proxyRegistry.proxies(owner)) == operator) {
            return true;
        }

        return super.isApprovedForAll(owner, operator);
    }
}