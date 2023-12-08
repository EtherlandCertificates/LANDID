pragma solidity 0.6.2;

import "./OwnableDelegateProxy.sol";

/**
* @title ProxyRegistry
* @dev OpenSea compliant feature
*/
contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}
