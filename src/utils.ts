const AUGUSTUS_SWAPPER = [
  `event Transfer(address indexed from, address indexed to, uint256 value)`,
];
const ADAPTER_INITIALIZED=[
`event AdapterInitialized(address indexed adapter)
`]
const ROUTER_INITIALIZED=[
`event RouterInitialized(address indexed router)
`]
const TRANSFER_TOKENS = [
  "function transferTokens(address,address payable ,uint256) external",
];
const SET_IMPLEMENTATION = [
  "function setImplementation(bytes4 , address )",
];
const SET_FEE_WALLET = [
  "function setFeeWallet(address payable _feeWallet) external",
];
export default {
  AUGUSTUS_SWAPPER,
  TRANSFER_TOKENS,
  SET_IMPLEMENTATION,
  SET_FEE_WALLET,
  ADAPTER_INITIALIZED,
  ROUTER_INITIALIZED
};
