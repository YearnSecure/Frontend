<template>
  <div id="yield" :class="isLoaded ? 'h-full' : 'h-screen'">
    <transition name="slide-fade">
      <main class="flex-1 relative z-0 overflow-y-auto focus:outline-none" tabindex="0">
        <Header
            :contractAddress="contractAddress"
            :isConnected="isConnected"
            :account="account"
            :chainId="chainId" />

        <AlertModal 
            v-if="showAlert"
            :alert="alert"
            :showConnectionButton="showConnectionButton"
            :showDownloadButton="showDownloadButton"
            @closeModal="closeModal" />

        <PageTitle 
            :title="title"
            :type="2"/>

        <YieldPool
            :yieldPool="yieldPool"
            :account="account"
            :showApproveButton="showApproveButton"
            :accountBalance="accountBalance"
            @stake="stake"
            @unStake="unStake"
            @claim="claim"
            @approve="approve" />
      </main>
    </transition>
  </div>
</template>

<script>
import Web3 from 'web3'

import AlertModal from '@/components/modals/Alert.modals'
import Header from '@/components/Header'
import PageTitle from '@/components/PageTitle'
import YieldPool from '@/components/views/yield/YieldPool.Yield'
import WalletConnector from "@/plugins/walletConnect.plugin";

export default {
  name: 'yield.cp.views',
  components: {
    AlertModal,
    Header,
    PageTitle,
    YieldPool
  },
  data() {
    return {
      contractAddress: process.env.VUE_APP_CONTRACT_ADDRESS_ETH,
      isConnected: false,
      showAlert: false,
      isLoaded: false,
      title: 'Yield Dashboard',
      account: this.$store.state.account,
      provider: window.ethereum,
      chainId: null,
      web3: null,
      accountBalance: "",
      yieldPool: {
        totalYsecStaked: 0,
        accountYsecStaked: 0,
        rewards: 0,
        ETHPool: null,
        preSales: 0,
        participants: 0
      },
      showConnectionButton: false,
      showDownloadButton: false,
      showApproveButton: true,
      alert: {
        title: '',
        msg: ''
      },
      contractAbi: [{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"address","name":"ysecPresaleAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"reward","type":"uint256"}],"name":"RewardAdded","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"forAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"forAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"forAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"DepositCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EndDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EthAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LastUpdateTime","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RewardPerTokenStored","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"RewardRate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"Stakers","outputs":[{"internalType":"uint256","name":"StakedAmount","type":"uint256"},{"internalType":"uint256","name":"Reward","type":"uint256"},{"internalType":"uint256","name":"UserRewardPerTokenPaid","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"StartDate","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TotalClaimedEthAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TotalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TotalStakers","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_ysecPresaleAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"_ysecTokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"periodDuration","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"Unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"ClaimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"RewardPerToken","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"LastTimeRewardApplicable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"Earned","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forAddress","type":"address"}],"name":"GetStaker","outputs":[{"components":[{"internalType":"uint256","name":"StakedAmount","type":"uint256"},{"internalType":"uint256","name":"Reward","type":"uint256"},{"internalType":"uint256","name":"UserRewardPerTokenPaid","type":"uint256"}],"internalType":"struct Staker","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"forAddress","type":"address"}],"name":"GetStakedAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}],
      tokenAbi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
    }
  },
  mounted: async function () {
    this.isLoaded = true;
    this.$loading(true);

    this.walletConnector = new WalletConnector(window.ethereum);
    await this.initConnection();
    await this.initYieldFarm();

    this.$loading(false);
  },
  methods: {
    initConnection: async function() {
      // check connection
      const isConnected = this.walletConnector.IsConnected();
      if (isConnected) {
        this.web3 = new Web3(this.provider);
      } else {
        this.web3 = this.walletConnector.GetProvider();
      }
      this.contractInterface = new this.web3.eth.Contract(this.contractAbi);
      this.contractInterface.options.address = process.env.VUE_APP_PRESALE_CONTRACT_ETH;

      await this.loadAccounts();
    },
    initYieldFarm: async function() {
      await this.getContractData();
      await this.tokenAllowance();
      await this.getAccountBalance();
    },
    getContractData: async function () {
      const contractAbi = this.contractAbi;
      const web3 = new Web3(this.provider);
      const contractInterface = new web3.eth.Contract(contractAbi);
      contractInterface.options.address = process.env.VUE_APP_YIELD_CONTRACT_ETH;

      // Get total YSEC staked
      await this.getTotalYsecStaked(contractInterface);
      // Get YSEC staked from connected account
      await this.getAccountYsecStaked(contractInterface);
      // Get Rewards
      await this.getRewards(contractInterface);
      // Get Eth in pool
      await this.getEthInPool();
      // Get Presales launched
      await this.getPresaleLaunched(contractInterface);
      // Get Participants
      await this.getParticipants(contractInterface);
    },
    tokenAllowance: async function() {
      await this.walletConnector.getAllowance(this.account, process.env.VUE_APP_YIELD_CONTRACT_ETH, process.env.VUE_APP_CONTRACT_ADDRESS_ETH, this.tokenAbi)
        .then((response) => {
          if (response > 500000000000000000000000) {
            this.showApproveButton = false;
            this.$store.state.yieldAllowance = true;
          }
        }).catch((e) => {
          console.log(`Error get token allowance: ${e.message}}`);
        });
    },
    getAccountBalance: async function() {
      await this.walletConnector.getAccountBalance(this.account, process.env.VUE_APP_CONTRACT_ADDRESS_ETH, this.tokenAbi)
        .then((response) => {
          if (response > "500000000000000000000000") {
            this.accountBalance = parseFloat(this.web3.utils.fromWei(response)).toFixed(5);
          }
        }).catch((e) => {
          console.log(`Error get yield pool amount: ${e.message}}`);
        });
    },
    approve: async function() {
      this.$loading(true);

      await this.walletConnector.approveCall(
        this.account,
        process.env.VUE_APP_YIELD_CONTRACT_ETH,
        1000000, // YSEC Total supply
        process.env.VUE_APP_CONTRACT_ADDRESS_ETH,
        this.tokenAbi)
        .then((response) => {
          if (response.status) {
            this.$notifications(
              'Approved success',
              ``,
              0, // success
              true);

            this.showApproveButton = false;
            this.$store.state.yieldAllowance = true;
          }
        }).catch((e) => {
          console.log(`Error approve wallet: ${e.message}}`);
          this.$notifications(
            'Something went wrong approving wallet',
            e,
            1, // error
            true);
        }).finally(() => {
          this.$loading(false);
        });
    },
    stake: async function(amount) {
      this.$loading(true);

      await this.walletConnector.stakeTokens(
        this.account,
        amount,
        process.env.VUE_APP_YIELD_CONTRACT_ETH,
        this.contractAbi)
      .then(() => {
        this.$notifications(
        'Staked successfully',
        ``,
        0, // success
        true);

        this.initYieldFarm();
      }).catch((e) => {
        console.log(`Error staking tokens: ${e.message}}`);
        this.$notifications(
        'Something went wrong staking',
        e,
        1, // error
        true);
      }).finally(() => {
        this.$loading(false);
      });
    },
    unStake: async function() {
      this.$loading(true);

      await this.walletConnector.unstakeTokens(
        this.account,
        process.env.VUE_APP_YIELD_CONTRACT_ETH,
        this.contractAbi)
        .then(() => {
          this.$notifications(
              'Unstaked successfully',
              ``,
              0, // success
              true);

          this.initYieldFarm();
        }).catch((e) => {
          console.log(`Error staking tokens: ${e.message}}`);
          this.$notifications(
              'Something went wrong unstaking',
              e,
              1, // error
              true);
        }).finally(() => {
          this.$loading(false);
        });
    },
    claim: async function() {
      this.$loading(true);

      await this.walletConnector.claimReward(
        this.account,
        process.env.VUE_APP_YIELD_CONTRACT_ETH,
        this.contractAbi)
        .then(() => {
          this.$notifications(
            'Reward claimed successfully',
            ``,
            0, // success
            true);

          this.initYieldFarm();
        }).catch((e) => {
          console.log(`Error staking tokens: ${e.message}}`);
          this.$notifications(
            'Something went wrong claiming your reward',
            e,
            1, // error
            true);
        }).finally(() => {
          this.$loading(false);
        });
    },
    getTotalYsecStaked: async function(contractInterface) {
      const web3 = new Web3;
      this.yieldPool.totalYsecStaked = parseFloat(web3.utils.fromWei(await contractInterface.methods.TotalStaked().call())).toFixed(5);
    },
    getAccountYsecStaked: async function(contractInterface) {
      const web3 = new Web3;
      this.yieldPool.accountYsecStaked = parseFloat(web3.utils.fromWei(await contractInterface.methods.GetStakedAmount(this.account).call())).toFixed(5);
    },
    getRewards: async function(contractInterface) {
      const web3 = new Web3;
      this.yieldPool.rewards = parseFloat(web3.utils.fromWei(await contractInterface.methods.Earned(this.account).call())).toFixed(5);
    },
    getEthInPool: async function() {
      const web3 = new Web3(this.provider);
      let ethInPool = 0;

      await web3.eth.getBalance(process.env.VUE_APP_YIELD_CONTRACT_ETH, function (err, result) {
        if (err) {
          this.$notifications(
              'Something went wrong reading balance',
              err,
              1, // error
              true);
        } else {
          ethInPool = parseFloat(web3.utils.fromWei(result)).toFixed(5);
        }
      });

      this.yieldPool.ETHPool = ethInPool.toString();
    },
    getPresaleLaunched: async function(contractInterface) {
      this.yieldPool.preSales = await contractInterface.methods.DepositCount().call();
    },
    getParticipants: async function(contractInterface) {
      this.yieldPool.participants = await contractInterface.methods.TotalStakers().call();
    },
    loadAccounts: async function() {
      const wallet = await this.walletConnector.GetAccounts();
      if (wallet !== undefined) {
        this.account = wallet[0];
        this.$store.state.account = wallet[0];
        this.chainId = await this.walletConnector.GetChainId();
        this.isConnected = true;
      }
    },
    closeModal: function () { 
      this.showAlert = !this.showAlert;
    },
    showError: function (title, msg, bool = false) {
      this.showAlert = !this.showAlert;
      this.alert.title = title
      this.alert.msg = msg;
      this.showConnectionButton = bool;
    }
  }
}
</script>
