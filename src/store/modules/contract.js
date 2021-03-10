export default {
  namespaced: true,

  state: {
    hal9k: null,
    hal9kLtd: null,
    hal9kNftPool: null,
    hal9kVault: null,
    hal9kv1Router: null,
    hal9kWethPair: null,
  },

  mutations: {
    setContracts(state, payload) {
      const {
        hal9k,
        hal9kLtd,
        hal9kNftPool,
        hal9kVault,
        hal9kv1Router,
        hal9kWethPair,
      } = payload;
      state.hal9k = hal9k;
      state.hal9kLtd = hal9kLtd;
      state.hal9kNftPool = hal9kNftPool;
      state.hal9kVault = hal9kVault;
      state.hal9kv1Router = hal9kv1Router;
      state.hal9kWethPair = hal9kWethPair;
    },
    clearContracts(state) {
      state.hal9k = null;
      state.hal9kLtd = null;
      state.hal9kNftPool = null;
      state.hal9kVault = null;
      state.hal9kv1Router = null;
      state.hal9kWethPair = null;
    },
  },
};
