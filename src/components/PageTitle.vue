:<template>
  <div id="page--title">
    <div class="px-4 mt-6 sm:px-6 lg:px-8">
      <div class="pb-5 border-b w-full border-gray-200 sm:items-center sm:justify-between">
        <div class="flex w-full">
          <h3 class="text-lg flexleading-6 font-medium text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <svg v-if="!showHelp && type > 0" v-on:click="toggleHelp" xmlns="http://www.w3.org/2000/svg" class="h-8 w-12 text-gray-900 dark:text-white flex pl-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else-if="showHelp && type > 0" v-on:click="toggleHelp" xmlns="http://www.w3.org/2000/svg" class="h-8 w-12 text-gray-900 dark:text-white flex pl-5 cursor-pointer" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
<!--        <div class="mt-3 sm:mt-0 sm:ml-4">-->
<!--          <Search />-->
<!--        </div>-->
        <div v-if="showHelp" class="block pb-5 pt-5">
          <div v-if="type === 1">
            <!-- Create IDO Page -->
            <p class="text-gray-900 dark:text-white">
              Creating an IDO is at your own risk. YSEC is not responsible for any mistakes made during the set up of your IDO.
              If you have any questions about functionalities found within its forms, please ask our team for help in our social channels.
            </p>
            <p class="py-5 text-gray-900 dark:text-white">
              Before using our IDO creation page please remember the following:
            </p>
            <ul class="text-gray-900 dark:text-white pl-5">
              <li class="list-item">
                Unsold tokens from the presale allocation will be divided among investors.
              </li>
              <li class="list-item pt-1">
                No adjustments can be made within the IDO contract after it has been submitted.
              </li>
              <li class="list-item pt-1">
                Tokens locked can only been released on set dates and times. YSEC is unable to unlock tokens within its vaults.
              </li>
              <li class="list-item pt-1">
                Listing an IDO through our platform will result in the listing of an ETH – Project Token pair on Uniswap.
              </li>
            </ul>
          </div>
          <div v-if="type === 2">
            <!-- Yield farm Page -->
            <p class="text-gray-900 dark:text-white">
              Our yield farm is the place to be. 2,5% of raised capital will be added here for stakers to farm.
              Your earnings will be based on the amount staked, not on the number of participants.
              For a general idea of your earnings you can divide your tokens staked by the ammount of tokens staked.
              Then you multiply the result with the ETH in the pool to get an insight, note that this is an approximate calculation,
              as when more YSEC is staked, your earnings will drop, when YSEC is unstaked, your earnings will rise.
              The top right bar will show how much you have earned since the moment you staked YSEC in our yield pool.
            </p>
            <p class="py-5 text-gray-900 dark:text-white">
              Before using our Yield farm please remember the following:
            </p>
            <ul class="text-gray-900 dark:text-white pl-5">
              <li class="list-item">
                The ‘Claim’ button will claim your reward farmed in ETH and just that.
              </li>
              <li class="list-item pt-1">
                The ‘Unstake’ button wil claim your reward farmed in ETH, AND unstake the total amount of YSEC you staked. It’s basically an exit button.
              </li>
            </ul>
          </div>
          <div v-if="type === 3">
            <!-- Dashboard Page -->
            <p class="text-gray-900 dark:text-white">
              Welcome to our IDO Dashboard. On this page you are presented with an overview of passed, ongoing and upcoming Initial Dex Offerings.
              All token metrics will be and / or have been executed exactly as the IDO detail pages show.
              One can track locked tokens by clicking the vault adresses, see what was raised, what was added towards creating a liquidity pair etc.
            </p>
            <p class="py-5 text-gray-900 dark:text-white">
              By automating our launchpad without being able to interfere after an IDO has listed and by executing tokenomics as displayed in the detail pages,
              we are trying to keep the DeFi space as safe as we can. However: listed projects are never to be considered financial advice.
              We always advice to do your own research and never invest with funds you are not willing to lose.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// import Search from '@/components/search/Form.search'

export default {
  name: 'pagetitle.components',
  props: {
    title: String,
    type: Number,
  },
  components: {
    // Search
  },
  data: () => ({
    showHelp: false,
  }),
  methods: {
    toggleHelp: function() {
      this.showHelp = !this.showHelp;
    }
  }
}
</script>

<style>

</style>