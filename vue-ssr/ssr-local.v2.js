// node 环境通过 require 导入依赖
// 先需要安装依赖 "dependencies": { "axios": "^1.9.0", "vue": "^2.7.16", "vue-server-renderer": "^2.7.16"}
const Vue = require("vue");
const axios = require("axios");

// HTML代码模版
const HTML_TEMPLATE = `
<html lang="en">
  <head>
    <title>Hello SSR</title>
  </head>
  <body>
    <div id="app"></div>
    <script id="js"></script>
  </body>
</html>
`;

// csr代码部分，因为要拼接代码，这里使用字符引入，需要的地方加上转义符\
const CSR_CODE = `
const preFetchData = {};
const App = {
  name: "app",
  props: {},
  // 内联DOM模板
  template: \`<div id="app"><div>{{ msg }}</div><button @click="add">{{ count }}</button></div>\`,
  data: function () {
    return {
      count: 0,
      msg: "",
    };
  },
  preFetch: async function name(params) {
    console.log("preFetch 开始，发送请求");
    const responseData = await axios.get("http://localhost:8080/data.json");
    preFetchData.data = responseData.data;
    console.log("preFetch 结束，请求返回", responseData.data);
  },
  created: async function () {
    console.log("created 开始");
    if (!preFetchData.data) {
      await App.preFetch();
    }
    const name = preFetchData.data.name;
    this.msg = \`Hello \${name}\`;
    console.log(\`created 结束, this.msg=\${this.msg}\`);
  },
  methods: {
    add: function () {
      this.count++;
    },
  },
};
`;
const App = new Function('axios', CSR_CODE + "return App;")(axios);
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
      const allCSRCode = `${CSR_CODE} new Vue({render: (h) => h(App)}).$mount("#app");`;
      const scriptStr = `<script src="http://127.0.0.1:8080/vue.v2.7.16.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.15.3/axios.min.js"></script><script>${allCSRCode}</script>`;
      const targetHtml = HTML_TEMPLATE.replace('<div id="app"></div>', html).replace('<script id="js"></script>', scriptStr);
      console.log("生成html", targetHtml);
    })
    .catch((err) => {
      console.error(err);
    });
});
