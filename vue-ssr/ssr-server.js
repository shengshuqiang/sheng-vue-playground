// 访问url http://127.0.0.1:8080/app.html

// 导入依赖包
const server = require("express")();
const path = require("path");

// 功能代码字符串，注意加转义符 \
const AppScriptStr = `
  // 业务组件
  const App = {
    name: "app",
    props: {},
    // 内联DOM模板
    template: \`<div id="app"><div>{{ msg }}</div><button @click="add">{{ count }}</button></div>\`,
    data: function () {
      return {
        count: 0,
        msg: "",
        isNode: true,
      };
    },
    beforeCreate: async function () {
      console.log("beforeCreate");
      // 判断是浏览器还是Node
      if (typeof window !== 'undefined') {
        console.log("beforeCreate preFetchData.data = window.__INITIAL_STATE__.data", window.__INITIAL_STATE__.data);
        preFetchData.data = window.__INITIAL_STATE__.data;
      }
    },
    preFetch: async function name(params) {
      console.log("before preFetch");
      const responseData = await axios.get(
          "https://cdn.jsdelivr.net/gh/shengshuqiang/sheng-vue-playground@main/vue-ssr/data.json"
        );
      const data = responseData.data;
      preFetchData.data = data;
      console.log("after preFetch", data);
    },
    created: async function () {
      console.log(\`Vue created\`);
      let name;
      if (preFetchData.data) {
        name = preFetchData.data.name;
      } else {
        const responseData = await App.preFetch();
        console.log('created responseData', responseData.data);
        name = responseData.data.name;
      }
      this.isNode = (typeof global !== 'undefined')
      const env = this.isNode ? 'Node' : 'Browser';
      this.msg = \`Hello \${name}\ in \${env}\`;
    },
    mounted: function () {
      console.log("app mounted");
    },
    methods: {
      add: function () {
        console.log("SSU add()");
        this.count++;
      }
    },
  };
`;

// 服务端额外代码，主要是依赖包导入以及
const ServerScriptStr = `
  const axios = require("axios");
  const Vue = require("vue");
  const preFetchData = {};
  {{AppScriptStr}}
  const server_vue = new Vue({
    created: async function () {
      console.log(\`vue-server-renderer new Vue created\`);
    },
    render: (h) => h(App),
  });
  return {server_vue, App, preFetchData};
`;
const ClientScriptStr = `
  <script src="https://cdn.jsdelivr.net/gh/shengshuqiang/sheng-vue-playground@main/vue/vue.v2.7.16.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.15.3/axios.min.js"></script>
  <script>
    const preFetchData = {};
    ${AppScriptStr}
    var appVue = new Vue({
      render: (h) => h(App),
    });
    // debugger
    appVue.$mount('#app');
    console.log('SSU appVue', appVue);
  </script>
`;

console.log(`start`);

// 服务的渲染
const serverSideRendering = function (req, res) {
  const renderer = require("vue-server-renderer").createRenderer({
    template: `<html lang="en">
  <head>
    <title>{{title}}</title>
  </head>
  <body>
    <!--vue-ssr-outlet-->
    <!-- 添加客户端入口文件 -->
    <div id='client-javascript'></div>
  </body>
</html>`,
  });

  const context = {
    title: "Hello SSU",
    meta: `
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    `,
  };
  console.log(`vue-server-renderer renderToString`);
  const { server_vue, App, preFetchData } = new Function(
    "require",
    "module",
    ServerScriptStr.replace("{{AppScriptStr}}", AppScriptStr)
  )(require, module);
  // 状态将自动序列化为 `window.__INITIAL_STATE__`，并注入 HTML
  context.state = preFetchData;
  // 请求完网络数据再渲染SSR
  App.preFetch().then(() => {
    renderer.renderToString(server_vue, context, (err, html) => {
      console.log(`vue-server-renderer renderToString html`, html, err);
      if (err) {
        res.status(500).end("Internal Server Error");
        return;
      }
      res.set("Content-Type", "text/html; charset=utf-8");
      const scriptHtml = html.replace(
        "<div id='client-javascript'></div>",
        ClientScriptStr
      );
      res.end(scriptHtml);
    });
  });
};

server.get("*", (req, res) => {
  console.log(`server.get`, req.url, req.headers.referer, req);
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
  // if (req.url === "/data.json") {
  //   res.status(200).json({ name: "sheng_SSU" });
  // } else 
  if (req.url === "/app.html") {
    serverSideRendering(req, res);
  }
  //  else if (req.url === "/vue.v2.7.16.js") {
  //   // http://127.0.0.1:8080/vue.v2.7.16.js
  //   res.type("application/javascript"); // 手动设置 Content-Type
  //   console.log(__dirname);
  //   res.sendFile(path.join(__dirname, "public", "../../vue/vue.v2.7.16.js"));
  // }
});

server.listen(8080);
