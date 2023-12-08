require('chai').use(require('chai-as-promised')).should();
const EVMRevert = require('./helpers/VMExceptionRevert');

const Proxy = artifacts.require('../contracts/ERC1822/Proxy.sol');
const Etherland = artifacts.require('../contracts/Etherland.sol');
const ProxyRegistry = artifacts.require('../contracts/ProxyRegistry.sol');

contract('Proxy', (accounts) => {
  let proxyRegistry;
  // implem
  let code;
  // proxy
  let etherland;
  let proxy;

  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const tokenName = 'TestToken';
  const tokenSymbol = 'TST';
  const baseURI = 'URI';

  beforeEach(async () => {
    proxyRegistry = await ProxyRegistry.new({ from: owner });
    code = await Etherland.new({ from: user1 });
    const constructData = code.contract.methods.init(tokenName, tokenSymbol, proxyRegistry.address, baseURI, owner).encodeABI();
    proxy = await Proxy.new(constructData, code.address, { from: owner });
    etherland = await Etherland.at(proxy.address);
  });

  it('checks if contract implements interfaces right', async () => {
    const erc165 = '0x01ffc9a7';
    const erc721 = '0x80ac58cd';
    const erc721enumerable = '0x780e9d63';
    const erc721metadata = '0x5b5e139f';
    const wrongInterface = '0x5b5e139d';
    (await etherland.supportsInterface(erc165)).toString().should.equal('true');
    (await etherland.supportsInterface(erc721)).toString().should.equal('true');
    (await etherland.supportsInterface(erc721enumerable)).toString().should.equal('true');
    (await etherland.supportsInterface(erc721metadata)).toString().should.equal('true');
    (await etherland.supportsInterface(wrongInterface)).toString().should.equal('false');
  });

  it('checks token details (name, symbol)', async () => {
    (await etherland.name()).toString().should.equal('TestToken');
    (await etherland.symbol()).toString().should.equal('TST');
  });

  it('test mint and batch mint functions', async () => {
    await etherland.mintTo(user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.mintTo(user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('1');
    await etherland.batchMintTo(5, user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('6');
  });

  it('test ownership of the contract', async () => {
    (await etherland.owner()).should.equal(owner);
    (await etherland.isOwner({ from: owner })).toString().should.equal('true');
    await etherland.transferOwnership(user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.transferOwnership(user1, { from: owner }).should.be.fulfilled;
    (await etherland.isOwner({ from: owner })).toString().should.equal('false');
    (await etherland.isOwner({ from: user1 })).toString().should.equal('true');
    await etherland.renounceOwnership({ from: owner }).should.be.rejectedWith(EVMRevert);
    await etherland.renounceOwnership({ from: user1 }).should.be.fulfilled;
    (await etherland.isOwner({ from: owner })).toString().should.equal('false');
    (await etherland.isOwner({ from: user1 })).toString().should.equal('false');
  });

  it('test token base uri functions', async () => {
    const uri2 = 'URI2';
    (await etherland.baseTokenURI()).toString().should.equal('URI');
    await etherland.setBaseTokenURI(uri2, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.setBaseTokenURI(uri2, { from: owner }).should.be.fulfilled;
    (await etherland.baseTokenURI()).toString().should.equal('URI2');
  });

  it('test burn function', async () => {
    await etherland.mintTo(user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('1');
    await etherland.burn(1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('0');
  });

  it('retrieve token uri', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    (await etherland.tokenURI(1)).toString().should.equal('URI1');
    (await etherland.tokenURI(2)).toString().should.equal('URI2');
    (await etherland.tokenURI(3)).toString().should.equal('URI3');
    (await etherland.tokenURI(4)).toString().should.equal('URI4');
    (await etherland.tokenURI(5)).toString().should.equal('URI5');
  });

  it('return token id by index for an investor holding several tokens', async () => {
    await etherland.mintTo(user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('1');
    await etherland.batchMintTo(5, user2, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user2)).toString().should.equal('5');
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('6');
    (await etherland.tokenOfOwnerByIndex(user1, 0)).toString().should.equal('1');
    (await etherland.tokenOfOwnerByIndex(user2, 0)).toString().should.equal('2');
    (await etherland.tokenOfOwnerByIndex(user2, 1)).toString().should.equal('3');
    (await etherland.tokenOfOwnerByIndex(user2, 2)).toString().should.equal('4');
    (await etherland.tokenOfOwnerByIndex(user2, 3)).toString().should.equal('5');
    (await etherland.tokenOfOwnerByIndex(user2, 4)).toString().should.equal('6');
    await etherland.tokenOfOwnerByIndex(user2, 5).should.be.rejectedWith(EVMRevert);
    (await etherland.tokenOfOwnerByIndex(user1, 1)).toString().should.equal('7');
    (await etherland.tokenOfOwnerByIndex(user1, 2)).toString().should.equal('8');
    (await etherland.tokenOfOwnerByIndex(user1, 3)).toString().should.equal('9');
    (await etherland.tokenOfOwnerByIndex(user1, 4)).toString().should.equal('10');
    (await etherland.tokenOfOwnerByIndex(user1, 5)).toString().should.equal('11');
    await etherland.tokenOfOwnerByIndex(user1, 6).should.be.rejectedWith(EVMRevert);
  });

  it('return total supply', async () => {
    (await etherland.totalSupply()).toString().should.equal('0');
    await etherland.batchMintTo(5, user2, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user2)).toString().should.equal('5');
    (await etherland.totalSupply()).toString().should.equal('5');
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    (await etherland.totalSupply()).toString().should.equal('10');
    await etherland.batchMintTo(5, user3, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user3)).toString().should.equal('5');
    (await etherland.totalSupply()).toString().should.equal('15');
  });

  it('return token id by index on the smart contract', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    (await etherland.tokenByIndex(0)).toString().should.equal('1');
    (await etherland.tokenByIndex(1)).toString().should.equal('2');
    (await etherland.tokenByIndex(2)).toString().should.equal('3');
    (await etherland.tokenByIndex(3)).toString().should.equal('4');
    (await etherland.tokenByIndex(4)).toString().should.equal('5');
    await etherland.tokenByIndex(6).should.be.rejectedWith(EVMRevert);
  });

  it('returns all token ids of an investor', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.batchMintTo(5, user2, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user2)).toString().should.equal('5');
    await etherland.batchMintTo(5, user3, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user3)).toString().should.equal('5');
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('10');
    (await etherland.tokensOf(user1)).toString().should.equal('1,2,3,4,5,16,17,18,19,20');
    (await etherland.tokensOf(user2)).toString().should.equal('6,7,8,9,10');
    (await etherland.tokensOf(user3)).toString().should.equal('11,12,13,14,15');
  });

  it('returns owner of a token id', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.batchMintTo(5, user2, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user2)).toString().should.equal('5');
    await etherland.batchMintTo(5, user3, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user3)).toString().should.equal('5');
    (await etherland.ownerOf(1)).should.equal(user1);
    (await etherland.ownerOf(2)).should.equal(user1);
    (await etherland.ownerOf(3)).should.equal(user1);
    (await etherland.ownerOf(4)).should.equal(user1);
    (await etherland.ownerOf(5)).should.equal(user1);
    (await etherland.ownerOf(6)).should.equal(user2);
    (await etherland.ownerOf(7)).should.equal(user2);
    (await etherland.ownerOf(8)).should.equal(user2);
    (await etherland.ownerOf(9)).should.equal(user2);
    (await etherland.ownerOf(10)).should.equal(user2);
    (await etherland.ownerOf(11)).should.equal(user3);
    (await etherland.ownerOf(12)).should.equal(user3);
    (await etherland.ownerOf(13)).should.equal(user3);
    (await etherland.ownerOf(14)).should.equal(user3);
    (await etherland.ownerOf(15)).should.equal(user3);
    await etherland.ownerOf(16).should.be.rejectedWith(EVMRevert);
  });

  it('testing approve function', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.approve(user1, 1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.approve(user2, 1, { from: user3 }).should.be.rejectedWith(EVMRevert);
    await etherland.approve(user2, 1, { from: user1 }).should.be.fulfilled;
    await etherland.approve(user2, 7, { from: user1 }).should.be.rejectedWith(EVMRevert);
    (await etherland.getApproved(1)).should.equal(user2);
  });

  it('testing approval for all function', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.setApprovalForAll(user1, true, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.setApprovalForAll(user2, true, { from: user1 }).should.be.fulfilled;
    (await etherland.isApprovedForAll(user1, user2)).toString().should.equal('true');
    await etherland.approve(user2, 1, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 2, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 3, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 4, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 5, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 7, { from: user2 }).should.be.rejectedWith(EVMRevert);
    (await etherland.getApproved(1)).should.equal(user2);
    (await etherland.getApproved(2)).should.equal(user2);
    (await etherland.getApproved(3)).should.equal(user2);
    (await etherland.getApproved(4)).should.equal(user2);
    (await etherland.getApproved(5)).should.equal(user2);
  });

  it('testing transferFrom function', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.setApprovalForAll(user2, true, { from: user1 }).should.be.fulfilled;
    (await etherland.isApprovedForAll(user1, user2)).toString().should.equal('true');
    await etherland.approve(user2, 1, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 2, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 3, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 4, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 5, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 7, { from: user2 }).should.be.rejectedWith(EVMRevert);
    (await etherland.getApproved(1)).should.equal(user2);
    (await etherland.getApproved(2)).should.equal(user2);
    (await etherland.getApproved(3)).should.equal(user2);
    (await etherland.getApproved(4)).should.equal(user2);
    (await etherland.getApproved(5)).should.equal(user2);
    (await etherland.ownerOf(1)).should.equal(user1);
    (await etherland.ownerOf(2)).should.equal(user1);
    (await etherland.ownerOf(3)).should.equal(user1);
    (await etherland.ownerOf(4)).should.equal(user1);
    (await etherland.ownerOf(5)).should.equal(user1);
    await etherland.transferFrom(user1, user3, 1, { from: user2 }).should.be.fulfilled;
    await etherland.transferFrom(user1, user3, 2, { from: user2 }).should.be.fulfilled;
    await etherland.transferFrom(user1, user3, 3, { from: user2 }).should.be.fulfilled;
    await etherland.transferFrom(user1, user2, 4, { from: user2 }).should.be.fulfilled;
    await etherland.transferFrom(user1, user2, 5, { from: user2 }).should.be.fulfilled;
    await etherland.transferFrom(user3, user1, 1, { from: user2 }).should.be.rejectedWith(EVMRevert);
    (await etherland.ownerOf(1)).should.equal(user3);
    (await etherland.ownerOf(2)).should.equal(user3);
    (await etherland.ownerOf(3)).should.equal(user3);
    (await etherland.ownerOf(4)).should.equal(user2);
    (await etherland.ownerOf(5)).should.equal(user2);
    (await etherland.balanceOf(user1)).toString().should.equal('0');
    (await etherland.balanceOf(user2)).toString().should.equal('2');
    (await etherland.balanceOf(user3)).toString().should.equal('3');
  });

  it('testing safeTransferFrom function', async () => {
    await etherland.batchMintTo(5, user1, { from: owner }).should.be.fulfilled;
    (await etherland.balanceOf(user1)).toString().should.equal('5');
    await etherland.setApprovalForAll(user2, true, { from: user1 }).should.be.fulfilled;
    (await etherland.isApprovedForAll(user1, user2)).toString().should.equal('true');
    await etherland.approve(user2, 1, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 2, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 3, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 4, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 5, { from: user2 }).should.be.fulfilled;
    await etherland.approve(user2, 7, { from: user2 }).should.be.rejectedWith(EVMRevert);
    (await etherland.getApproved(1)).should.equal(user2);
    (await etherland.getApproved(2)).should.equal(user2);
    (await etherland.getApproved(3)).should.equal(user2);
    (await etherland.getApproved(4)).should.equal(user2);
    (await etherland.getApproved(5)).should.equal(user2);
    (await etherland.ownerOf(1)).should.equal(user1);
    (await etherland.ownerOf(2)).should.equal(user1);
    (await etherland.ownerOf(3)).should.equal(user1);
    (await etherland.ownerOf(4)).should.equal(user1);
    (await etherland.ownerOf(5)).should.equal(user1);
    await etherland.safeTransferFromWithData(user1, user3, 1, '0x01ffc9a7', { from: user2 }).should.be.fulfilled;
    await etherland.safeTransferFrom(user1, user3, 2, { from: user2 }).should.be.fulfilled;
    await etherland.safeTransferFrom(user1, user3, 3, { from: user2 }).should.be.fulfilled;
    await etherland.safeTransferFrom(user1, user2, 4, { from: user2 }).should.be.fulfilled;
    await etherland.safeTransferFrom(user1, user2, 5, { from: user2 }).should.be.fulfilled;
    await etherland.safeTransferFrom(user3, user1, 1, { from: user2 }).should.be.rejectedWith(EVMRevert);
    (await etherland.ownerOf(1)).should.equal(user3);
    (await etherland.ownerOf(2)).should.equal(user3);
    (await etherland.ownerOf(3)).should.equal(user3);
    (await etherland.ownerOf(4)).should.equal(user2);
    (await etherland.ownerOf(5)).should.equal(user2);
    (await etherland.balanceOf(user1)).toString().should.equal('0');
    (await etherland.balanceOf(user2)).toString().should.equal('2');
    (await etherland.balanceOf(user3)).toString().should.equal('3');
  });

  it('testing admin rights', async () => {
    (await etherland.canMint({ from: owner })).toString().should.equal('true');
    (await etherland.canMintBurn({ from: owner })).toString().should.equal('true');
    (await etherland.canMint({ from: user1 })).toString().should.equal('false');
    (await etherland.canMintBurn({ from: user1 })).toString().should.equal('false');
    await etherland.batchMintTo(5, user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.grantMinterRights(user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.grantMinterBurnerRights(user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.grantMinterRights(user1, { from: owner }).should.be.fulfilled;
    (await etherland.canMint({ from: user1 })).toString().should.equal('true');
    await etherland.batchMintTo(5, user1, { from: user1 }).should.be.fulfilled;
    (await etherland.canMintBurn({ from: user1 })).toString().should.equal('false');
    await etherland.burn(1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.grantMinterBurnerRights(user1, { from: owner }).should.be.fulfilled;
    (await etherland.canMintBurn({ from: user1 })).toString().should.equal('true');
    await etherland.burn(1, { from: user1 }).should.be.fulfilled;
    await etherland.revokeAdminRights(user1, { from: user2 }).should.be.rejectedWith(EVMRevert);
    await etherland.revokeAdminRights(user1, { from: owner }).should.be.fulfilled;
    (await etherland.canMint({ from: user1 })).toString().should.equal('false');
    (await etherland.canMintBurn({ from: user1 })).toString().should.equal('false');
    await etherland.batchMintTo(5, user1, { from: user1 }).should.be.rejectedWith(EVMRevert);
    await etherland.burn(2, { from: user1 }).should.be.rejectedWith(EVMRevert);
  });
});
