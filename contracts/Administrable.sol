pragma solidity 0.6.2;

import "./Ownable.sol";

/**
 * @title Administrable
 * @dev Handle allowances for NFTs administration :
 *      - minting
 *      - burning
 *      - access to admin web interfaces
 * @dev ADMINS STORAGE 
 * @dev rights are integer(int16) defined as follow :
 *       1 : address can only mint tokens 
 *       2 : address can mint AND burn tokens
*/
contract Administrable is Ownable {
    
    mapping(address => int16) private admins;

    event AdminRightsGranted(address indexed newAdmin, int16 adminRights);
    event AdminRightsRevoked(address indexed noAdmin);

    /**
    * @dev know if an address has admin rights and its type of rights
    * @param _admin the address to find admin rights of
    * @return int16 the admin right for _admin :
    *       1 : address can only mint tokens 
    *       2 : address can mint AND burn tokens 
    */
    function adminRightsOf(address _admin) public view returns(int16) {
        if (_admin == owner()) return 2;
        else return admins[_admin];
    }

    /**
    * @dev verifiy if an address can mint new tokens
    * @param _admin : the address to verify minting rights of
    * @return a boolean, truthy when _admin has rights to mint new tokens
    */
    function isMinter(address _admin) public view returns (bool) {
        if (_admin == owner()) return true;
        else return(
            admins[_admin] > 0
        );
    }


    /**
    * @dev verifiy if an address has rights to mint and burn new tokens
    * @param _admin : the address to verify minter-burner rights of
    * @return a boolean, truthy when _admin has rights to mint and burn new tokens
    */
    function isMinterBurner(address _admin) public view returns (bool) {
        if (_admin == owner()) return true;
        else return(
            admins[_admin] == 2
        );
    }


    /**
    * @dev canMint external 
    * @return bool : truthy if msg.sender has admin rights to mint new tokens
    */
    function canMint() public view returns(bool) {
        return(
            isMinter(msg.sender)
        );
    }


    /**
    * @dev canBurn external
    * @return bool : truthy if msg.sender has admin rights to mint new tokens and burn existing tokens
    */
    function canMintBurn() public view returns(bool) {
        return(
            isMinterBurner(msg.sender)
        );
    }

    /**
    * @dev onlyMinter internal
    */
    modifier onlyMinter() {
        require(
            canMint(),
            "denied : no admin minting rights"
        );
        _;
    }

    /**
    * @dev onlyBurner internal
    */
    modifier onlyMinterBurner() {
        require(
            canMintBurn(),
            "denied : no admin burning rights"
        );
        _;
    }

    modifier validAddress(address _admin) {
        require(_admin != address(0), "invalid admin address");
        _;
    }

    /**
    * @dev owner can grant admin access to allow any address to mint new tokens
    * @dev Restricted to CONTRACT OWNER ONLY
    * @param _admin : address to grant admin minter rights to
    */
    function grantMinterRights(address _admin) external onlyOwner validAddress(_admin) {
        admins[_admin] = 1;
        emit AdminRightsGranted(_admin, 1);
    }

    /**
    * @dev owner can grant admin access to allow any address to mint new tokens and to burn existing tokens
    * @dev Restricted to CONTRACT OWNER ONLY
    * @param _admin : address to grant admin minter and burner rights to
    */
    function grantMinterBurnerRights(address _admin) external onlyOwner validAddress(_admin) {
        admins[_admin] = 2;
        emit AdminRightsGranted(_admin, 2);
    }

    /**
    * @dev owner can revoke admin right of any admin address
    * @dev Restricted to CONTRACT OWNER ONLY
    * @param _admin : address to revoke admin access to
    */
    function revokeAdminRights(address _admin) external onlyOwner validAddress(_admin) {
        admins[_admin] = 0;
        emit AdminRightsRevoked(_admin);
    }

}