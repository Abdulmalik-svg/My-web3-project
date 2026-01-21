import FundMeMultiAbi from "./FundMeMultiAbi.json";
import { ethers } from "ethers";

// Your newest deployment
const RAW_ADDRESS = "0x0EFAB53C9D8e713A4E40e4CcB6784de183553Bb6";

export const FUNDME_ADDRESS = ethers.getAddress(RAW_ADDRESS);

// Ensures compatibility regardless of how the JSON is structured
export const FUNDME_ABI = FundMeMultiAbi.abi ? FundMeMultiAbi.abi : FundMeMultiAbi;

export const CHAIN_ID = 11155111;
export const NETWORK_NAME = "Sepolia";