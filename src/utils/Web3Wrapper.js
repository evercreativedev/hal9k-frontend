import detectEthereumProvider from "@metamask/detect-provider";
import { Artifact, NETWORKID } from "./config";
import Hal9kJson from "./abi/Hal9k.json";
import Hal9kLtdJson from "./abi/Hal9kLtd.json";
import Hal9kNftPoolJson from "./abi/Hal9kNftPool.json";
import Hal9kVaultJson from "./abi/Hal9kVault.json";
import Hal9kv1Router from "./abi/Hal9kv1Router.json";
import ERC20 from "./abi/ERC20.json";
import store from "../store";
import Web3 from "web3";
import vue from "../main";
class Web3Wrapper {
  handleChainChanged = (_chainId) => {
    store.commit("account/setChainId", _chainId);
    if (parseInt(_chainId) !== NETWORKID) {
      this.disconnect();
      vue.$snotify.error("Please change the network");
    }
  };

  handleAccountsChanged = (accounts) => {
    const { address } = store.state.account;
    if (accounts.length === 0) {
      this.disconnect();
    } else if (accounts[0] !== address) {
      store.commit("account/setAddress", accounts[0]);
    }
  };

  disconnect = () => {
    store.dispatch("account/disconnect");
    store.commit("metamask/clearProvider");
    store.commit("contract/clearContracts");
  };

  connect = async () => {
    try {
      this.disconnect();
      const provider = await detectEthereumProvider();
      if (provider) {
        if (provider !== window.ethereum)
          throw new Error("Do you have multiple wallets installed?");
      } else {
        throw new Error("Please install MetaMask!");
      }
      if (parseInt(provider.chainId) !== NETWORKID) {
        this.disconnect();
        vue.$snotify.error("Please change the network");
        return;
      }
      provider.on("accountsChanged", this.handleAccountsChanged);
      provider.on("chainChanged", this.handleChainChanged);
      provider.on("disconnect", (res) => {
        store.dispatch("account/disconnect");
      });
      provider
        .request({ method: "eth_requestAccounts" })
        .then(this.handleAccountsChanged)
        .catch((err) => {
          console.error(err);
          store.dispatch("account/disconnect");
        });
      const web3 = new Web3(provider);
      console.log('deployed contract address:', Artifact.hal9k);
      const hal9k = new web3.eth.Contract(Hal9kJson, Artifact.hal9k);
      hal9k.setProvider(provider);

      const hal9kLtd = new web3.eth.Contract(Hal9kLtdJson, Artifact.hal9kLtd);
      hal9kLtd.setProvider(provider);

      const hal9kNftPool = new web3.eth.Contract(
        Hal9kNftPoolJson,
        Artifact.hal9kNftPool
      );
      hal9kNftPool.setProvider(provider);

      const hal9kVault = new web3.eth.Contract(
        Hal9kVaultJson,
        Artifact.hal9kVault
      );
      hal9kVault.setProvider(provider);

      const hal9kv1Router = new web3.eth.Contract(
        Hal9kv1Router,
        Artifact.hal9kv1Router
      );
      hal9kv1Router.setProvider(provider);

      const hal9kWethPair = new web3.eth.Contract(ERC20, Artifact.pairAddress);
      hal9kWethPair.setProvider(provider);
      store.commit("metamask/setProvider", provider);
      store.commit("metamask/setWeb3", web3);
      store.commit("contract/setContracts", {
        hal9k,
        hal9kLtd,
        hal9kNftPool,
        hal9kVault,
        hal9kv1Router,
        hal9kWethPair,
      });
    } catch (err) {
      console.error(err);
      this.disconnect();
    }
  };
}

const HalWeb3 = new Web3Wrapper();
export default HalWeb3;
