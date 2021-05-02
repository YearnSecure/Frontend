<template>
  <div id="presale" :class="!isLoaded ? 'h-screen' : ''">
    <transition name="slide-fade">
      <main v-if="isLoaded" class="flex-1 relative z-0 overflow-y-auto focus:outline-none" tabindex="0">
        <Header
            :contractAddress="contractAddress"
            :isConnected="isConnected"
            :account="account" />

        <AlertModal
            v-if="showAlert"
            :alert="alert"
            :showConnectionButton="showConnectionButton"
            :showDownloadButton="showDownloadButton"
            @closeModal="closeModal" />

        <PageTitle
            :title="title"
            :type="0"/>

        <div class="block px-4 mt-6 sm:px-6 lg:px-8">
          <PresaleData :presale="presale" />
        </div>
        <div class="block px-4 mt-6 sm:px-6 lg:px-8">
          <div class="lg:grid sm:grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-1 col-span-2">
              <TeamInformation :presale="presale" />
              <TokenInformation :presale="presale" />
              <PresaleInformation
                  :presale="presale"
                  :progressPercentage="progressPercentage"
                  :progressStyle="progressStyle"/>
            </div>
            <div class="lg:col-span-3 col-span-2">
              <div class="md:grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div class="col-span-2">
                  <TokenAllocations
                      :presale="presale"
                      :web3="web3"/>
                </div>
                <div class="col-span-1">
                  <span class="block text-1xl text-center leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-1xl">
                    Token allocation chart
                  </span>
                  <Chart class="block mt-5" style="height: 300px;" :chartData="presale.chartData" :options="options" />
                </div>
              </div>
            </div>
          </div>
          <div class="block mt-8">
            <PresaleActions
                :presale="presale"
                :allowanceState="allowanceState"
                :account="account"
                @approveCall="approveCall"
                @transferTokens="transferTokens"
                @contributeTokens="contributeTokens"
                @retrieve="retrieve"
                @retrieveTokensOwner="retrieveTokensOwner"
                @transferTokensToLocks="transferTokensToLocks"
                @addLiquidity="addLiquidity"
                @claimTokens="claimTokens"
                @distribute="distribute"
            />
          </div>
        </div>
      </main>
    </transition>
  </div>
</template>

<script>
import AlertModal from '@/components/modals/Alert.modals'
import Header from '@/components/Header'
import PageTitle from '@/components/PageTitle'

import PresaleData from '@/components/views/presale/PresaleData'
import TeamInformation from '@/components/views/presale/TeamInformation'
import TokenInformation from '@/components/views/presale/TokenInformation'
import PresaleInformation from '@/components/views/presale/PresaleInformation'
import TokenAllocations from '@/components/views/presale/TokenAllocations'
import PresaleActions from '@/components/views/presale/PresaleActions'

import Chart from '@/components/views/dashboard/presale/charts/Presale.Chart'
import Web3 from "web3";
import WalletConnector from "@/plugins/walletConnect.plugin";

export default {
  name: "presale.detail.cp.views",
  components: {
    AlertModal,
    Header,
    PageTitle,
    PresaleData,
    TeamInformation,
    TokenInformation,
    PresaleInformation,
    TokenAllocations,
    PresaleActions,
    Chart
  },
  data() {
    return {
      id: this.$route.params.id,
      walletConnector: null,
      totalSupply: 0,
      tokensInPresale: 0,
      liquidityTokens: 0,
      presale: {
        Name: '',
        StartDate: null,
        EndDate: null,
        SoftCap: null,
        HardCap: null,
        TokenAddress: null,
        LiquidityLocked: null,
        TotalSupply: null,
        TotalTokenAmount: null,
        TokensInPresale: null,
        RawTokensInPresale: null,
        TokenLiquidity: null,
        TokenPrice: null,
        TotalContributed: null,
        TokenOwnerAddress: "",
        EthDistributable: null,
        TokenTimeLock: null,
        CurrentStep: 0,
        Github: null,
        Medium: null,
        Telegram: null,
        Website: null,
        Twitter: null,
        allocations: [],
        UserContribution: null,
        Roi: null,
        TokenName: null,
        finished: false,
        started: false,
        SoftCapMet: false,
        listingTokenPrice: null,
        listingPrice: null,
        chartData: {
          datasets: [
            {
              data: [],
              backgroundColor: [
                '#db7d02',
                '#f78c00',
                '#f49d2c',
                '#f2a541',
                '#f9af4d',
                '#fbc279',
                '#f59e0b',
                '#f4a213',
                '#eda323',
                '#e0a031',
                '#dba341',
              ],
            }
          ],
          labels: []
        }
      },
      contractPresale: {},
      contractAddress: process.env.VUE_APP_CONTRACT_ADDRESS_ETH,
      isConnected: false,
      showAlert: false,
      isLoaded: false,
      title: 'Presale',
      account: this.$store.state.account,
      provider: window.ethereum,
      chainId: null,
      showAddAllocationButton: true,
      presalesChart: [],
      tokenAllocations: [],
      allowanceState: "0",
      Allocations: {},
      webState: 0,
      contribution: "",
      alert: {
        title: '',
        msg: ''
      },
      options: {
        responsive: true,
        legend: {
          display: false,
          position: 'left',
        },
        maintainAspectRatio: false
      },
      showConnectionButton: false,
      showDownloadButton: false,
      progressStyle: 'width: 0%',
      progressPercentage: "0",
      web3: null,
      contractInterface: null,
      tokenInterface: null,
      contractAbi: [{"inputs":[{"internalType":"address","name":"timelockFactoryAddress","type":"address"},{"internalType":"address","name":"yieldFeeAddress","type":"address"},{"internalType":"address","name":"feeAddress","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"claimer","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"ClaimedTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"contributor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Contributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthFeeDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"reciever","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"EthYieldFeeDistributed","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"NoTokensTransferedToLocks","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"address","name":"contributor","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RetrievedEth","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RetrievedTokens","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensTransfered","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TokensTransferedToLocks","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"presaleId","type":"uint256"},{"indexed":false,"internalType":"bool","name":"permaLockedLiq","type":"bool"},{"indexed":false,"internalType":"uint256","name":"amountOfEth","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"amountOfTokens","type":"uint256"}],"name":"UniswapLiquidityAdded","type":"event"},{"inputs":[],"name":"FeeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"PresaleIndexer","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"Presales","outputs":[{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"string","name":"Website","type":"string"},{"internalType":"string","name":"Telegram","type":"string"},{"internalType":"string","name":"Twitter","type":"string"},{"internalType":"string","name":"Github","type":"string"},{"internalType":"string","name":"Medium","type":"string"}],"internalType":"struct PresaleInfo","name":"Info","type":"tuple"},{"internalType":"uint256","name":"StartDate","type":"uint256"},{"internalType":"uint256","name":"EndDate","type":"uint256"},{"internalType":"uint256","name":"Softcap","type":"uint256"},{"internalType":"uint256","name":"Hardcap","type":"uint256"},{"internalType":"uint256","name":"TokenLiqAmount","type":"uint256"},{"internalType":"uint256","name":"LiqPercentage","type":"uint256"},{"internalType":"uint256","name":"TokenPresaleAllocation","type":"uint256"},{"internalType":"bool","name":"PermalockLiq","type":"bool"},{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"uint256","name":"Amount","type":"uint256"},{"internalType":"uint256","name":"RemainingAmount","type":"uint256"},{"internalType":"uint256","name":"ReleaseDate","type":"uint256"},{"internalType":"bool","name":"IsInterval","type":"bool"},{"internalType":"uint256","name":"PercentageOfRelease","type":"uint256"},{"internalType":"uint256","name":"IntervalOfRelease","type":"uint256"},{"internalType":"bool","name":"Exists","type":"bool"},{"internalType":"address","name":"Token","type":"address"}],"internalType":"struct TokenAllocation","name":"LiquidityTokenAllocation","type":"tuple"},{"components":[{"internalType":"address","name":"TokenOwnerAddress","type":"address"},{"internalType":"address","name":"TokenAddress","type":"address"},{"internalType":"address","name":"TokenTimeLock","type":"address"}],"internalType":"struct PresaleDataAddresses","name":"Addresses","type":"tuple"},{"components":[{"internalType":"uint256","name":"TotalTokenAmount","type":"uint256"},{"internalType":"uint256","name":"Step","type":"uint256"},{"internalType":"uint256","name":"ContributedEth","type":"uint256"},{"internalType":"uint256","name":"RaisedFeeEth","type":"uint256"},{"internalType":"bool","name":"Exists","type":"bool"},{"internalType":"uint256","name":"RetrievedTokenAmount","type":"uint256"},{"internalType":"uint256","name":"RetrievedEthAmount","type":"uint256"},{"internalType":"uint256","name":"NumberOfContributors","type":"uint256"}],"internalType":"struct PresaleDataState","name":"State","type":"tuple"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"TimelockFactoryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UniswapFactoryAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"UniswapRouterAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"YieldFeeAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"timelockFactoryAddress","type":"address"}],"name":"SetTimelockFactory","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"yieldFeeAddress","type":"address"}],"name":"SetYieldFeeAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"feeAddress","type":"address"}],"name":"SetFeeAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"router","type":"address"}],"name":"SetUniswapRouterAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"router","type":"address"}],"name":"SetUniswapFactoryAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"uint256","name":"StartDate","type":"uint256"},{"internalType":"uint256","name":"EndDate","type":"uint256"},{"internalType":"uint256","name":"Softcap","type":"uint256"},{"internalType":"uint256","name":"Hardcap","type":"uint256"},{"internalType":"uint256","name":"TokenLiqAmount","type":"uint256"},{"internalType":"uint256","name":"LiqPercentage","type":"uint256"},{"internalType":"uint256","name":"TokenPresaleAllocation","type":"uint256"},{"internalType":"bool","name":"PermalockLiq","type":"bool"},{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"uint256","name":"Amount","type":"uint256"},{"internalType":"uint256","name":"RemainingAmount","type":"uint256"},{"internalType":"uint256","name":"ReleaseDate","type":"uint256"},{"internalType":"bool","name":"IsInterval","type":"bool"},{"internalType":"uint256","name":"PercentageOfRelease","type":"uint256"},{"internalType":"uint256","name":"IntervalOfRelease","type":"uint256"},{"internalType":"bool","name":"Exists","type":"bool"},{"internalType":"address","name":"Token","type":"address"}],"internalType":"struct TokenAllocation[]","name":"TokenAllocations","type":"tuple[]"},{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"uint256","name":"Amount","type":"uint256"},{"internalType":"uint256","name":"RemainingAmount","type":"uint256"},{"internalType":"uint256","name":"ReleaseDate","type":"uint256"},{"internalType":"bool","name":"IsInterval","type":"bool"},{"internalType":"uint256","name":"PercentageOfRelease","type":"uint256"},{"internalType":"uint256","name":"IntervalOfRelease","type":"uint256"},{"internalType":"bool","name":"Exists","type":"bool"},{"internalType":"address","name":"Token","type":"address"}],"internalType":"struct TokenAllocation","name":"LiquidityTokenAllocation","type":"tuple"},{"internalType":"address","name":"Token","type":"address"},{"internalType":"string","name":"Website","type":"string"},{"internalType":"string","name":"Telegram","type":"string"},{"internalType":"string","name":"Twitter","type":"string"},{"internalType":"string","name":"Github","type":"string"},{"internalType":"string","name":"Medium","type":"string"}],"internalType":"struct PresaleSettings","name":"settings","type":"tuple"}],"name":"CreatePresale","outputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"TransferTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"Contribute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"},{"internalType":"address","name":"contributor","type":"address"}],"name":"RetrieveEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"RetrieveTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"TransferTokensToLocks","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"AddUniswapLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"ClaimTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"DistributeEth","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"PresaleStarted","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"PresaleFinished","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"SoftcapMet","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"HardcapMet","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"PresaleIndexerLength","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"GetTokenAllocations","outputs":[{"components":[{"internalType":"string","name":"Name","type":"string"},{"internalType":"uint256","name":"Amount","type":"uint256"},{"internalType":"uint256","name":"RemainingAmount","type":"uint256"},{"internalType":"uint256","name":"ReleaseDate","type":"uint256"},{"internalType":"bool","name":"IsInterval","type":"bool"},{"internalType":"uint256","name":"PercentageOfRelease","type":"uint256"},{"internalType":"uint256","name":"IntervalOfRelease","type":"uint256"},{"internalType":"bool","name":"Exists","type":"bool"},{"internalType":"address","name":"Token","type":"address"}],"internalType":"struct TokenAllocation[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"},{"internalType":"address","name":"forAddress","type":"address"}],"name":"GetEthContributedForAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"},{"internalType":"address","name":"forAddress","type":"address"}],"name":"GetAmountOfTokensForAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"},{"internalType":"address","name":"forAddress","type":"address"}],"name":"GetHardcapAmountOfTokensForAddress","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"GetRatio","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"presaleId","type":"uint256"}],"name":"GetNumberOfContributors","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}],
      tokenAbi: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"owner","type":"address"},{"indexed":true,"name":"spender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"}]
    }
  },
  mounted: async function () {
    this.$loading(true);
    this.walletConnector = new WalletConnector(window.ethereum);

    await this.initContract();
    await this.getPresaleData();
    await this.initTokenContract();
    await this.initDetailPage();

    this.isLoaded = true;
    this.$loading(false);
  },
  methods: {
    initContract: async function() {
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
    initTokenContract: async function() {
      this.web3 = new Web3(this.provider);
      this.tokenInterface = new this.web3.eth.Contract(this.tokenAbi);
      this.tokenInterface.options.address = this.presale.TokenAddress;
    },
    initDetailPage: async function() {
      await this.getTokenTicker();
      await this.getSoftcapMet();

      if (this.account !== "" && this.account.toLowerCase() === this.presale.TokenOwnerAddress.toLowerCase()){
        await this.getAllowance();
        await this.getContributedEth();
      }

      if (parseInt(this.presale.CurrentStep) === 1){
        await this.getPresaleFinished();
        if (!this.presale.finished){
          await this.getPresaleStarted();
        }
      }
      await this.getTokenAllocations();
      this.setProgressBar();
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
    getPresaleData: async function() {
      const response = await this.walletConnector.getPresaleData(this.id, process.env.VUE_APP_PRESALE_CONTRACT_ETH, this.contractAbi);
      //Presale Info
      this.presale.Name = response.Info.Name;
      this.presale.StartDate = (parseInt(response.StartDate));
      this.presale.EndDate = (parseInt(response.EndDate));
      this.presale.Softcap = this.readableFormatNumbers(this.web3.utils.fromWei(response.Softcap));
      this.presale.Hardcap = this.readableFormatNumbers(this.web3.utils.fromWei(response.Hardcap));
      this.presale.TokenAddress = response.Addresses.TokenAddress;
      this.presale.LiquidityLocked = response.LiqPercentage;
      this.totalSupply = this.web3.utils.fromWei(response.State.TotalTokenAmount);
      this.presale.TotalSupply = this.readableFormatNumbers(this.web3.utils.fromWei(response.State.TotalTokenAmount));
      this.presale.TotalTokenAmount = response.State.TotalTokenAmount;
      this.presale.TokensInPresale = this.readableFormatNumbers(this.web3.utils.fromWei(response.TokenPresaleAllocation));
      this.tokensInPresale = this.web3.utils.fromWei(response.TokenPresaleAllocation);
      this.presale.RawTokensInPresale = this.web3.utils.fromWei(response.TokenPresaleAllocation);
      this.presale.TokenLiquidity = this.readableFormatNumbers(this.web3.utils.fromWei(response.TokenLiqAmount));
      this.liquidityTokens = this.web3.utils.fromWei(response.TokenLiqAmount);
      this.presale.TokenPrice = this.getTokenPrice();
      this.presale.TotalContributed = this.web3.utils.fromWei(response.State.ContributedEth);
      this.presale.TokenOwnerAddress = response.Addresses.TokenOwnerAddress;
      this.presale.EthDistributable = (response.State.ContributedEth - response.State.RetrievedEthAmount) > 0;
      this.presale.TokenTimeLock = response.Addresses.TokenTimeLock;

      const presalePrice = this.web3.utils.fromWei(response.TokenPresaleAllocation)/this.web3.utils.fromWei(response.Hardcap);
      const listingPrice = this.web3.utils.fromWei(response.TokenLiqAmount) / ((response.LiqPercentage/100)*Number(this.web3.utils.fromWei(response.Hardcap)*0.95));
      this.presale.listingPrice =  (presalePrice/listingPrice).toFixed(2);

      const hardCapPercentage = Number(this.web3.utils.fromWei(response.Hardcap)) * 0.95;
      const toLiquidity = hardCapPercentage * ((1/100) * Number(response.LiqPercentage));
      this.presale.listingTokenPrice = (toLiquidity / Number(this.web3.utils.fromWei(response.TokenLiqAmount))).toFixed(10);

      //Current Presale Step
      this.presale.CurrentStep = response.State.Step;
      //Socials
      this.presale.Github = response.Info.Github;
      this.presale.Medium = response.Info.Medium;
      this.presale.Telegram = response.Info.Telegram;
      this.presale.Twitter = response.Info.Twitter;
      this.presale.Website = response.Info.Website;
    },
    getTokenAllocations: async function() {
      const response = await this.walletConnector.getTokenAllocations(this.id, process.env.VUE_APP_PRESALE_CONTRACT_ETH, this.contractAbi);

      this.presale.Allocations = response;
      const totalSupply = this.totalSupply;
      for (let i=0; i < response.length; i++) {
        this.presale.chartData.labels.push(response[i].Name);
        const amount = this.web3.utils.fromWei(response[i].Amount);
        const percentage =  amount / totalSupply * 100;

        this.presale.chartData.datasets[0].data.push(percentage);
      }

      const tokenPresalePercentage = this.tokensInPresale / totalSupply * 100;
      this.presale.chartData.labels.push('Tokens in presale');
      this.presale.chartData.datasets[0].data.push(tokenPresalePercentage);

      const liquidityPercentage = this.liquidityTokens / totalSupply * 100;
      this.presale.chartData.labels.push('Token liquidity');
      this.presale.chartData.datasets[0].data.push(liquidityPercentage);
    },
    getContributedEth: async function() {
      await this.walletConnector.getContributedEth(this.id, this.account, process.env.VUE_APP_PRESALE_CONTRACT_ETH, this.contractAbi)
        .then((response) => {
          if (parseInt(response) === 0){
            this.presale.UserContribution = 0;
            this.presale.Roi = 0;
          } else {
            this.presale.UserContribution = this.web3.utils.fromWei(response);
            this.getRoi();
          }
        }).catch((e) => {
          console.log(`Error get roi: ${e.message}}`);
        });
    },
    getTokenTicker: async function() {
      await this.walletConnector.getTokenTicker(this.presale.TokenAddress, this.tokenAbi)
          .then((response) => {
            this.presale.TokenName = response;
          }).catch((e) => {
            console.log(`Error get token ticker: ${e.message}}`);
          });
    },
    getRoi: async function() {
      await this.walletConnector.getRoi(this.id, this.account, process.env.VUE_APP_PRESALE_CONTRACT_ETH, this.contractAbi)
        .then((response) => {
          this.presale.Roi = this.web3.utils.fromWei(response);
        }).catch((e) => {
          console.log(`Error get roi: ${e.message}}`);
        });
    },
    getTokenPrice: function() {
      return parseInt(this.presale.Hardcap)/(parseInt(this.presale.RawTokensInPresale));
    },
    getAllowance: async function () {
      await this.walletConnector.getAllowance(this.account, process.env.VUE_APP_PRESALE_CONTRACT_ETH, this.presale.TokenAddress, this.tokenAbi)
        .then((response) => {
          this.allowanceState = response;
        }).catch((e) => {
          console.log(`Error get allowance: ${e.message}}`);
        });
    },
    approveCall: async function () {
      this.$loading(true);

      await this.walletConnector.approveCall(
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.presale.TotalTokenAmount,
          this.presale.TokenAddress,
          this.tokenAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error approve wallet: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    transferTokens: async function() {
      this.$loading(true);

      await this.walletConnector.transferTokens(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error transfer tokens: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    getPresaleFinished: async function() {
      this.presale.finished = await this.walletConnector.presaleFinished(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi);
    },
    getPresaleStarted: async function() {
      this.presale.finished = await this.walletConnector.getPresaleStarted(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi);
    },
    addLiquidity: async function () {
      this.$loading(true);

      await this.walletConnector.addLiquidity(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error claim tokens: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    claimTokens: async function() {
      this.$loading(true);

      await this.walletConnector.claimTokensAccount(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error claim tokens: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    distribute: async function() {
      this.$loading(true);

      await this.walletConnector.distribute(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error distribute: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    retrieve: async function() {
      this.$loading(true);

      await this.walletConnector.retrieve(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error retrieve: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    retrieveTokensOwner: async function() {
      this.$loading(true);

      await this.walletConnector.retrieveTokensOwner(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error retrieve tokens owner: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    transferTokensToLocks: async function() {
      this.$loading(true);

      await this.walletConnector.transferTokensToLocks(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error transfer tokens to locks: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    getSoftcapMet: async function() {
      this.presale.SoftcapMet = await this.walletConnector.getSoftcapMet(
          this.id,
          this.account,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi);
    },
    contributeTokens: async function(amountOfTokens) {
      this.$loading(true);

      await this.walletConnector.contributeTokens(
          this.id,
          this.account,
          amountOfTokens,
          process.env.VUE_APP_PRESALE_CONTRACT_ETH,
          this.contractAbi)
        .then(() => {
          this.contribution = "";
          this.initDetailPage();
        }).catch((e) => {
          console.log(`Error contribute tokens: ${e.message}}`);
        }).finally(() => {
          this.$loading(false);
        });
    },
    readableFormatNumbers: function(x){
      const parts = x.toString().split(".");
      parts[0]=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,".");
      return parts.join(",");
    },
    setProgressBar: function() {
      const hardCap = Number(this.presale.Hardcap);
      const totalContributed = Number(this.presale.TotalContributed); //web3.utils.fromWei(this.presale.TotalContributed.toString());
      const percentage = totalContributed / Number(hardCap) * 100;
      this.progressPercentage = percentage.toFixed(2);
      this.progressStyle = `width: ${percentage}%; background-color: #f59e0b;`;
    },
    formatDate: function(date) {
      // const dateTimeOffset = Math.abs()
      return new Date(date).toUTCString();
    },
    formatEpochDate: function(date) {
      return new Date(date * 1000);
    },
    formatFromWei: function(wei) {
      return this.web3.utils.fromWei(wei.toString());
    },
    closeModal: function() {
      this.showAlert = false;
    },
    showError: function (
        title,
        msg,
        showConnectButton = false,
        showDownloadButton = false) {
      this.showAlert = !this.showAlert;
      this.alert.title = title
      this.alert.msg = msg;
      this.showConnectionButton = showConnectButton;
      this.showDownloadButton = showDownloadButton;
    }
  }
}
</script>
<style lang="scss">
.icon {
  svg {
    path {
      color: #FFF;
    }
  }
}
</style>