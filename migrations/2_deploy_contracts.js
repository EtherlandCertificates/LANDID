const Etherland = artifacts.require('./Etherland.sol');
const Proxy = artifacts.require('./ERC1822/Proxy.sol');

const Web3 = require('web3');

const web3 = new Web3(Web3.givenProvider);

const osProxies = {
  'rinkeby-fork': '0xf57b2c51ded3a29e6891aba85459d600256cf317',
  rinkeby: '0xf57b2c51ded3a29e6891aba85459d600256cf317',
  live: '0xa5409ec958c83c3f309868babaca7c86dcb077c1',
};

const { DEPLOY_ETHERLAND_ERC721, OWNER} = process.env;
const NAME = 'Etherland';
const SYMBOL = 'LANDID';
const BASE_TOKEN_URI = 'https://fieldcoin-nft.herokuapp.com/api/token/';

/**
 * @dev Contract Deployer
 * @notice run the `truffle deploy` command
 * @see readme
 */
module.exports = async (deployer, network) => {
  const openSeaProxy = osProxies[network];

  if (DEPLOY_ETHERLAND_ERC721 && openSeaProxy) {
    await deployer.deploy(Etherland, { gas: 3000000 });
    const { abi, address } = Etherland;
    const logic = new web3.eth.Contract(abi, address, { address });
    const constructData = logic.methods.init(NAME, SYMBOL, openSeaProxy, BASE_TOKEN_URI, OWNER).encodeABI();
    await deployer.deploy(Proxy, constructData, address);
  } else console.error('Etherland contract is not ready for deployment, please check your settings at 2_deploy_contracts.js');
};

