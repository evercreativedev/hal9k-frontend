export default {
  namespaced: true,

  state: {
    started: false,
    ongoing: false,
    scheduled: false,
    startTimeStamp: 0,
    endTimeStamp: 0,
    duration: 0,
  },

  mutations: {
    setStarted(state, payload) {
      state.started = payload;
    },
    setOngoing(state, payload) {
      state.ongoing = payload;
    },
    setScheduled(state, payload) {
      state.scheduled = payload;
    },
    setStartTimeStamp(state, payload) {
      state.startTimeStamp = payload;
    },
    setEndTimeStamp(state, payload) {
      state.endTimeStamp = payload;
    },
    setDuration(state, payload) {
      state.duration = payload;
    },
  },
};
