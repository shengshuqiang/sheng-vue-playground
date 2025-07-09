// 访问url http://127.0.0.1:8080/app.html

// node 环境通过 require 导入依赖
// 先需要安装依赖 "dependencies": { "axios": "^1.9.0", "vue": "^2.7.16", "vue-server-renderer": "^2.7.16", "express": "^4.21.2",}
const Vue = require("vue");
const axios = require("axios");
const path = require("path");
const server = require("express")();

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
const { App, preFetchData } = new Function(
  "axios",
  CSR_CODE + "return {App, preFetchData};"
)(axios);
// 第 1 步：创建一个 vue 实例
const appVue = new Vue({
  render: (h) => h(App),
});
// 不需要挂载，node环境没有dom，也没法挂载
// app.$mount("#app");

// 第 2 步：创建一个 renderer
const renderer = require("vue-server-renderer").createRenderer();

function serverSideRendering(req, res) {
  const context = {};
  // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML
  context.state = preFetchData;
  res.writeHead(200, {
    "Transfer-Encoding": "chunked",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "text/html; charset=utf-8",
  });
  // 等一会
  const waitAMonent = async (time) => {
    await new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  };
  // 请求完网络数据再渲染SSR
  App.preFetch().then(async () => {
    // 第 3 步：将 Vue 实例渲染为 HTML
    const stream = renderer.renderToStream(appVue, context);
    const allCSRCode = `${CSR_CODE} new Vue({render: (h) => h(App)}).$mount("#app");`;
    const scriptStr = `<script src="http://127.0.0.1:8080/vue.v2.7.16.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.15.3/axios.min.js"></script><script>${allCSRCode}</script>`;
    const htmlTemplates = HTML_TEMPLATE.split('<div id="app"></div>');
    res.write(htmlTemplates[0]);

    // 监听数据流事件
    stream.on("data", async (data) => {
      await waitAMonent(3000);
      // http写入流式数据
      res.write(data.toString());
      console.log("stream.on(data)", data.toString());
    });

    // 监听流结束事件
    stream.on("end", async () => {
      await waitAMonent(6000);
      // http结束流式数据
      res.end(
        htmlTemplates[1].replace('<script id="js"></script>', scriptStr)
      );
      console.log("stream.on(end)"); // 渲染完成
    });

    stream.on("error", (err) => {
      console.log("stream.on(error)", err);
      // handle error...
    });
    // .then((html) => {

    // })
    // .catch((err) => {
    //   console.error(err);
    // });
  });
}

// 服务端口监听处理
server.get("*", (req, res) => {
  // console.log(`server.get`, req.url, req.headers.referer, req);
  // CROS
  // 设置允许的来源
  const referer = req.headers.referer || "http://127.0.0.1:8080/";

  res.setHeader(
    "Access-Control-Allow-Origin",
    referer.substring(0, referer.length - 1)
  );
  // 设置允许的请求方法
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  // 设置允许的请求头
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  // 设置预检请求的缓存时间（可选）
  res.setHeader("Access-Control-Max-Age", "3600");
  if (req.url === "/data.json") {
    res.status(200).json({ name: "sheng_SSU" });
  } else if (req.url === "/app.html") {
    serverSideRendering(req, res);
  } else if (req.url === "/vue.v2.7.16.js") {
    // http://127.0.0.1:8080/vue.v2.7.16.js
    res.type("application/javascript"); // 手动设置 Content-Type
    console.log(__dirname);
    res.sendFile(path.join(__dirname, "public", "../../vue/vue.v2.7.16.js"));
  }
});

server.listen(8080);
