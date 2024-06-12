const { Web3 } = require("web3");
const axios = require("axios");

const provider = new Web3.providers.HttpProvider(
  "https://polygon-mainnet.g.alchemy.com/v2/Nv4V3XXVPE086cd9pNC4OKt6JltZNifQ"
);
const web3 = new Web3(provider);
const contractAddress = "0x...Edge Activity Token contract address...";
const contractCreatorAddress = "0x...contract creator address...";
const polygonscanApiKey = "YOUR_POLYGONSCAN_API_KEY";

async function getTransactionHistory(address) {
  console.log(`Getting transaction history for address ${address}`);
  const transactions = await web3.eth.getPastLogs({
    fromBlock: 0,
    toBlock: "latest",
    address: contractAddress,
    topics: [web3.utils.sha3("Transfer(address,address,uint256)")],
  });
  console.log(`Transactions: ${JSON.stringify(transactions, null, 2)}`);

  const transactionHistory = transactions.filter((tx) => {
    const from = tx.topics[1].slice(26);
    const to = tx.topics[2].slice(26);
    return from === address || to === address;
  });
  console.log(
    `Transaction history: ${JSON.stringify(transactionHistory, null, 2)}`
  );

  return transactionHistory;
}

async function analyzeTransactions() {
  const response = await axios.get(
    `https://api.polygonscan.com/api?module=token&action=gettokenholders&contractaddress=${contractAddress}&page=1&offset=100&apikey=${polygonscanApiKey}`
  );
  const data = response.data.result;
  const tokenHolders = data.map((holder) => holder.holder);
  console.log(`Token holders: ${JSON.stringify(tokenHolders, null, 2)}`);
  const activeWallets = {};

  for (const holder of tokenHolders) {
    if (holder === contractCreatorAddress) continue;
    const transactionHistory = await getTransactionHistory(holder);
    const transactionCount = transactionHistory.length;
    activeWallets[holder] = transactionCount;
  }

  console.log(`Active wallets: ${JSON.stringify(activeWallets, null, 2)}`);

  const sortedWallets = Object.entries(activeWallets).sort(
    (a, b) => b[1] - a[1]
  );
  console.log(`Sorted wallets: ${JSON.stringify(sortedWallets, null, 2)}`);

  const top5Wallets = sortedWallets.slice(0, 5);
  console.log(`Top 5 wallets: ${JSON.stringify(top5Wallets, null, 2)}`);

  console.log("Top 5 most active wallets:");
  for (const [wallet, count] of top5Wallets) {
    console.log(`Wallet: ${wallet} - Transaction count: ${count}`);
  }
}

analyzeTransactions().catch((err) => console.error(err));
