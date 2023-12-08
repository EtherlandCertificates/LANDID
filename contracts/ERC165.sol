pragma solidity 0.6.2;

import "./Interfaces/IERC165.sol";
import "./Storage.sol";

/**
* @title ERC165
* @author Matt Condon (@shrugs)
* @dev Implements ERC165 using a lookup table.
* @dev source : openzeppelin-solidity/contracts/introspection/ERC165.sol
*/
contract ERC165 is IERC165, Storage {

    /**
    * @dev implement supportsInterface(bytes4) using a lookup table
    */
    function supportsInterface(bytes4 interfaceId) external override view returns (bool) {
        return _supportedInterfaces[interfaceId];
    }

    /**
    * @dev internal method for registering an interface
    */
    function _registerInterface(bytes4 interfaceId) internal {
        require(interfaceId != 0xffffffff, "bad interface");
        _supportedInterfaces[interfaceId] = true;
    }
}
