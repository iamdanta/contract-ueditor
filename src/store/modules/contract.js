/**
 * contract
 * @description
 * 合同的状态存储
 */
export default {
  namespaced: true,
  state: {
    contractData: []
  },
  mutations: {
    setContractData(state, data) {
      state.contractData = data;
    }
  },
  actions: {
    setContractData({ commit }, data) {
      commit('setContractData', data);
    }
  }
};
