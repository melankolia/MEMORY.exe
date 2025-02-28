export const connectWallet = async () => {
  if (typeof window.ethereum === "undefined") {
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    throw error;
  }
};

export const getConnectedAccount = async () => {
  if (typeof window.ethereum === "undefined") {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_accounts",
    });
    return accounts[0] || null;
  } catch (error) {
    console.error("Error getting connected account:", error);
    return null;
  }
};

export const listenToAccountChanges = (callback) => {
  if (typeof window.ethereum === "undefined") return;

  window.ethereum.on("accountsChanged", (accounts) => {
    callback(accounts[0] || null);
  });
};
