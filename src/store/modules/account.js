export default {
  namespaced: true,

  state: {
    address: null,
    chainId: null,
    reward: null, // 1 ~ 10 : NFT Card Type,
    // 0: Entered new stage, but didn't get reward,
    // 11: Nailed the reward nft card or moved to the next stage
    lastUpdateTime: null,
    balance: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    stage: null,
    stakingStarted: false,
  },

  mutations: {
    setAddress(state, payload) {
      state.address = payload;
    },
    setChainId(state, payload) {
      state.chainId = payload;
    },
    setStakingStarted(state, payload) {
      state.stakingStarted = payload;
    },
    updateBalance(state, payload) {
      const { type, amount } = payload;
      state.nftBalance[type - 1] = amount;
    },
    setBalance(state, payload) {
      state.balance = payload;
    },
    clearBalance(state, payload) {
      state.balance = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    },
    setAccount(state, payload) {
      const { reward, lastUpdateTime, stage } = payload;
      state.reward = reward;
      state.lastUpdateTime = lastUpdateTime;
      state.stage = stage;
    },
    setReward(state, payload) {
      state.reward = payload;
    },
    setLastUpdateTime(state, payload) {
      state.lastUpdateTime = payload;
    },
    setStage(state, payload) {
      state.stage = payload;
    },
  },
  actions: {
    clearAccount({ commit, state }) {
      commit("setAccount", {
        reward: null,
        lastUpdateTime: null,
        stage: null,
      });
    },
    clearBalance({ commit, state }) {
      commit("clearBalance");
    },
    dumpReward({ commit, state }) {
      commit("setReward", 0);
    },
    disconnect({ commit, state }) {
      commit("setAddress", null);
      commit("setChainId", null);
      commit("setAccount", {
        reward: null,
        lastUpdateTime: null,
        stage: null,
      });
    },
  },
};
