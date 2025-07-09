import Vue from "vue";
import Vuex from "vuex";
// import axios from "axios";
import { fetchDataAPI, fetchItem } from "../api";

Vue.use(Vuex);

export function createStore() {
  return new Vuex.Store({
    state: {
      name: "",
    },
    actions: {
      fetchData({ commit }, id) {
        // `store.dispatch()` 会返回 Promise，
        console.log("store  fetchData");
        // 以便我们能够知道数据在何时更新
        return (
          fetchDataAPI()
            // return fetchItem(1)
            .then((res) => {
              console.log("store fetchDataAPI res", res);
              const { data } = res;
              console.log(data);
              const { name } = data || {};
              commit("setName", { id, name });
            })
            .catch((err) => {
              console.log("store fetchDataAPI err", err);
            })
        );
      },
    },
    mutations: {
      setName(state, { id, name }) {
        console.log(`Vue setName`, this.state, { id, name });
        this.state.name = name;
      },
    },
  });
}
