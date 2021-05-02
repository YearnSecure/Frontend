import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3 from "web3";

export default class WalletConnector {
    private metamaskProvider: any
    private metamaskConnected: boolean;
    private walletConnectConnected: boolean;
    private tempWC: WalletConnectProvider;

    constructor(metaMaskProvider: any) {
        this.metamaskProvider = metaMaskProvider;
        this.tempWC = new WalletConnectProvider({
            infuraId: process.env.VUE_APP_INFURA,
            rpc: {
                1: "https://mainnet.infura.io/v3/",
                3: "https://ropsten.infura.io/v3/",
            },
        });

        this.metamaskConnected = false;
        this.walletConnectConnected = false;
    }
    // Returns bool of the connection MetaMask or WalletConnect
    IsConnected() {
        this.metamaskConnected = this.IsMetamaskConnected();
        this.walletConnectConnected = this.IsWalletConnectConnected();
        return this.metamaskConnected || this.walletConnectConnected;
    }
    // Check if MetaMask is connected
    IsMetamaskConnected() {
        if (this.metamaskProvider === undefined)
            return false;

        if (!this.metamaskProvider.isMetaMask)
            return false;

        if(!this.metamaskProvider.isConnected())
            return false;

        if(this.metamaskProvider._state.accounts.length == 0)
            return false;

        return true;
    }
    // Check if WalletConnect is connected
    IsWalletConnectConnected() {
        const isConnected = this.tempWC.connector.connected;
        if(isConnected)
            this.tempWC.enable()
                .then(() => {
                    return isConnected;
                });

        return isConnected;
    }
    // Connect with MetaMask wallet
    ConnectMetaMask() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment,@typescript-eslint/ban-ts-ignore
        // @ts-ignore
        this.metamaskProvider = window.ethereum;
        return this.metamaskProvider
            .request({ method: 'eth_requestAccounts' });
    }
    // Connect with WalletConnect
    ConnectWalletConnect() {
        return this.tempWC.enable();
    }
    // Check which provider is connected
    GetProvider() {
        if(this.metamaskConnected) {
            return new Web3(this.metamaskProvider);
        } else if (this.walletConnectConnected){
            return new Web3(this.tempWC as any);
        }

        return new Web3(new Web3.providers.HttpProvider(`${process.env.VUE_APP_RPC}/${process.env.VUE_APP_INFURA}`));
    }
    // Returns the connected accounts
    async GetAccounts() {
        const web3 = this.GetProvider();
        if(web3 !== null)
        {
            if (this.walletConnectConnected){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment,@typescript-eslint/ban-ts-ignore
                // @ts-ignore
                return web3.currentProvider.accounts;
            } else if(this.metamaskConnected) {
                return await web3.eth.getAccounts();
            }
        }
    }
    // Returns the connected chainId
    async GetChainId() {
        const web3 = this.GetProvider();
        if(web3 !== null)
        {
            if (this.walletConnectConnected){
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment,@typescript-eslint/ban-ts-ignore
                // @ts-ignore
                return web3.currentProvider.chainId;
            } else if (this.metamaskConnected) {
                return this.metamaskProvider.chainId;
            }
        }
    }
    // Disconnect the connected wallet
    Disconnect() {
        if(this.walletConnectConnected)
            return this.tempWC.disconnect();
        else if (this.metamaskConnected) {
            this.metamaskProvider._state.isConnected = false;
            this.metamaskConnected = false;
        }

        this.metamaskConnected = this.IsMetamaskConnected();
        this.walletConnectConnected = this.IsWalletConnectConnected();

        return null;
    }

    // Contract Calls

    // Presale detail: Get all the presale information data
    async getPresaleData(id: any, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.Presales(id).call();
        }
    }

    // Presale detail: Get token allocations for specific presale
    async getTokenAllocations(id: any, address: string, abi: any,) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.GetTokenAllocations(id).call();
        }
    }

    // Presale detail: Check how much ETH the connected address has contributed
    async getContributedEth(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.GetEthContributedForAddress(id, account).call();
        }
    }

    // Presale detail: Get the token ticker
    async getTokenTicker(tokenAddress: string, tokenAbi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const tokenContractInterface = new web3.eth.Contract(tokenAbi);
            tokenContractInterface.options.address = tokenAddress;
            return await tokenContractInterface.methods.symbol().call();
        }
    }

    // Presale detail: Get the amount of tokens the connected account received when presale is finished
    async getRoi(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.GetAmountOfTokensForAddress(id, account).call();
        }
    }

    // Presale detail: Get allowance of the connected account
    // Yield: Get allowance of connected account
    async getAllowance(account: string, address: string, tokenAddress: string, tokenAbi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const tokenContractInterface = new web3.eth.Contract(tokenAbi);
            tokenContractInterface.options.address = tokenAddress;
            return await tokenContractInterface.methods.allowance(account, address).call();
        }
    }

    // Presale detail: Approve current account
    // Yield farm: Approve current account
    async approveCall(account: string, address: string, totalTokens: any, tokenAddress: string, tokenAbi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const tokenContractInterface = new web3.eth.Contract(tokenAbi);
            tokenContractInterface.options.address = tokenAddress;
            return await tokenContractInterface.methods.approve(address, totalTokens).send({from: account});
        }
    }

    // Presale detail: Transfer tokens for specific Presale
    async transferTokens(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.TransferTokens(id).send({from: account});
        }
    }

    // Presale detail: Check if presale is finished
    async presaleFinished(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.PresaleFinished(id).call({from: account});
        }
    }

    // Presale detail: Check if presale is started
    async getPresaleStarted(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.PresaleStarted(id).call({from: account});
        }
    }

    // Presale detail: Add liquidity
    async addLiquidity(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.AddUniswapLiquidity(id).send({from: account});
        }
    }

    // Presale detail: Claim the tokens the connected account has bought
    async claimTokensAccount(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.ClaimTokens(id).send({from: account});
        }
    }

    // Presale detail: Distribute ETH
    async distribute(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.DistributeEth(id).send({from: account});
        }
    }

    // Presale detail: Retrieve ETH
    async retrieve(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.RetrieveEth(id, account).send({from: account});
        }
    }

    // Presale detail: Retrieve token owners based on presale ID
    async retrieveTokensOwner(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.RetrieveTokens(id).send({from: account});
        }
    }

    // Presale detail: Transfer the tokens to locks
    async transferTokensToLocks(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.TransferTokensToLocks(id).send({from: account});
        }
    }

    // Presale detail: Check if softcap is met for specific presale
    async getSoftcapMet(id: any, account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.SoftcapMet(id).call({from: account});
        }
    }

    // Presale detail: Account can contribute to presale
    async contributeTokens(id: any, account: string, amountOfTokens: any, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.Contribute(id).send({from: account, value: web3.utils.toWei(amountOfTokens.toString())});
        }
    }

    // Get balance of account
    async getAccountBalance(account: string, tokenAddress: string, tokenAbi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const tokenContractInterface = new web3.eth.Contract(tokenAbi);
            tokenContractInterface.options.address = tokenAddress;
            return await tokenContractInterface.methods.balanceOf(account).call();
        }
    }

    // Stale YSEC tokens
    async stakeTokens(account: string, amountOfTokens: any, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.Stake(web3.utils.toWei(amountOfTokens.toString())).send({from: account});
        }
    }

    // Unstake YSEC token
    async unstakeTokens(account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.Unstake().send({from: account});
        }
    }

    // Claim rewards from pool
    async claimReward(account: string, address: string, abi: any) {
        const web3 = this.GetProvider();
        if(web3 != null) {
            const presaleContractInterface = new web3.eth.Contract(abi);
            presaleContractInterface.options.address = address;
            return await presaleContractInterface.methods.ClaimReward().send({from: account});
        }
    }
}
