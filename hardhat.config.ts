import * as dotenv from "dotenv";
import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "@nomiclabs/hardhat-ethers";
import '@openzeppelin/hardhat-upgrades';
import "hardhat-deploy";
import "solidity-coverage";

dotenv.config();

// set proxy
const proxyUrl = 'http://127.0.0.1:7890';   // change to yours, With the global proxy enabled, change the proxyUrl to your own proxy link. The port may be different for each client.
const { ProxyAgent, setGlobalDispatcher } = require("undici");
const proxyAgent = new ProxyAgent(proxyUrl);
setGlobalDispatcher(proxyAgent);

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (_, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
export const GWEI = 1000000000;
const accounts = process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : []

const defaultNetwork = "hardhat";
const config: HardhatUserConfig = {
  defaultNetwork,
  networks: {
    hardhat: {
      forking: {
        //   // url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.MUMBAI_API_KEY}`
        url: `https://1rpc.io/base`,
        //   // url: `https://eth-mainnet.g.alchemy.com/v2/${process.env.MAINNET_API_KEY}`,
        blockNumber: 7835608,
      }
    },
    localhost: {
      url: "http://localhost:8545",
    },
    matictest: {
      url: "https://rpc.ankr.com/polygon_mumbai",
      accounts: accounts,
      chainId: 80001
    },
    ftmtest: {
      url: "https://rpc.ankr.com/fantom_testnet",
      accounts: accounts
    },
    avaxtest: {
      url: "https://rpc.ankr.com/avalanche_fuji",
      chainId: 43113,
      accounts: accounts
    },
    bsctest: {
      url: "https://bsctestapi.terminet.io/rpc",
      chainId: 97,
      accounts: accounts
    },
    ethtest: {
      url: "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: accounts
    },

    eth: {
      url: "https://1rpc.io/eth",
      chainId: 1,
      accounts: accounts
    },
    arb: {
      url: "https://1rpc.io/arb",
      chainId: 42161,
      accounts: accounts
    },
    op: {
      url: "https://1rpc.io/op",
      chainId: 10,
      accounts: accounts
    },
    bnb: {
      url: "https://1rpc.io/bnb",
      chainId: 56,
      accounts: accounts
    },
    polygon: {
      url: "https://rpc.ankr.com/polygon",
      gasPrice: 100 * GWEI,
      accounts: accounts,
    },
    ftm: {
      url: "https://rpc3.fantom.network",
      gasPrice: 2 * GWEI,
      accounts: accounts,
    },
    avax: {
      url: "https://1rpc.io/avax/c",
      gasPrice: 26 * GWEI,
      chainId: 43114,
      accounts: accounts,
    },
    base: {
      url: "https://1rpc.io/base",
      gasPrice: 0.11 * GWEI,
      chainId: 8453,
      accounts: accounts,
    },
    zks: {
      url: "https://1rpc.io/zksync2-era",
      gasPrice: 0.25 * GWEI,
      chainId: 324,
      accounts: accounts,
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    }
  },
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}

export default config;
