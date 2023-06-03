import getConfig from '../../data/nearConfig.js';
import * as nearAPI from 'near-api-js';

// Initializing contract
export async function initNear(env, contractName) {
  // get network configuration values from config.js
  // based on the network ID we pass to getConfig()
  const nearConfig = getConfig(env, contractName);

  // create a keyStore for signing transactions using the user's key
  // which is located in the browser local storage after user logs in
  const keyStore = new nearAPI.keyStores.BrowserLocalStorageKeyStore();

  // Initializing connection to the NEAR testnet
  const near = await nearAPI.connect({ keyStore, ...nearConfig });

  // Initialize wallet connection
  const walletConnection = new nearAPI.WalletConnection(near);

  const provider = new nearAPI.providers.JsonRpcProvider(
    nearConfig.archivalUrl
  );

  // Load in user's account data
  let currentUser;
  if (walletConnection.getAccountId()) {
    currentUser = {
      // Gets the accountId as a string
      accountId: walletConnection.getAccountId(),
      // Gets the user's token balance
      balance: (await walletConnection.account().state()).amount,
    };
  }

  return { currentUser, nearConfig, walletConnection, provider };
}
