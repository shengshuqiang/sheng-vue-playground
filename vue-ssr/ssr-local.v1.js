// node 环境通过 require 导入依赖
// 先需要安装依赖 "dependencies": { "axios": "^1.9.0", "vue": "^2.7.16", "vue-server-renderer": "^2.7.16"}
const Vue = require("vue");
const axios = require("axios");

// 同csr代码部分
const preFetchData = {};
const App = {
  name: "app",
  props: {},
  // 内联DOM模板
  template: `<div id="app"><div>{{ msg }}</div><button @click="add">{{ count }}</button></div>`,
  data: function () {
    return {
      count: 0,
      msg: "",
    };
  },
  preFetch: async function name(params) {
    console.log("preFetch 开始，发送请求");
    const responseData = await axios.get("https://cdn.jsdelivr.net/gh/shengshuqiang/sheng-vue-playground@main/vue-ssr/data.json");
    preFetchData.data = responseData.data;
    console.log("preFetch 结束，请求返回", responseData.data);
  },
  created: async function () {
    console.log("created 开始");
    if (!preFetchData.data) {
      await App.preFetch();
    }
    const name = preFetchData.data.name;
    this.msg = `Hello ${name}`;
    console.log(`created 结束, this.msg=${this.msg}`);
  },
  methods: {
    add: function () {
      this.count++;
    },
  },
};

// 第 1 步：创建一个 vue 实例
const app = new Vue({
  render: (h) => h(App),
});
// 不需要挂载，node环境没有dom，也没法挂载
// app.$mount("#app");

// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

App.preFetch().then(() => {
  // 第 3 步：将 Vue 实例渲染为 HTML
  renderer
    .renderToString(app)
    .then((html) => {
      console.log("生成html", html);
    })
    .catch((err) => {
      console.error(err);
    });
});
