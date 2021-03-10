export default {
  namespaced: true,

  state: {
    provider: null,
    web3: null,
  },

  mutations: {
    setProvider(state, payload) {
      state.provider = payload;
    },
    setWeb3(state, payload) {
      state.web3 = payload;
    },
    clearProvider(state) {
      state.web3 = null;
      state.provider = null;
    },
  },
};
