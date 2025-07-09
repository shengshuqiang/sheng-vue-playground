const appVNode = {
  componentInstance: {
    _vnode: {
      tag: "div",
      children: [
        {
          tag: "div",
          children: [{ tag: undefined, text: "Hello sheng_SSU" }],
        },
        {
          tag: "button",
          children: [{ tag: undefined, text: "0" }],
        },
        {
          tag: "vue-component-2-input-component",
          componentInstance: {
            _vnode: {
              tag: "div",
              children: [
                {
                  tag: "input",
                  text: "0",
                  data: {
                    attrs: { placeholder: "hello" },
                    domProps: { value: "" },
                  },
                },
                {
                  tag: "div",
                  children: [{ text: "" }],
                },
              ],
            },
          },
        },
      ],
    },
  },
};

// const vnode = {
//   tag: "vue-component-1-app",
//   componentInstance: undefined,
//   elm: undefined,
//   text: undefined,
//   children: undefined,
// };

const appElement = {
  id: "app",
  tagName: "DIV",
  children: [
    {
      tagName: "DIV",
      id: "",
      textContent: "Hello sheng_SSU in Node",
    },
    {
      tagName: "BUTTON",
      textContent: "0",
    },
  ],
};

// const appVueVNode = {
//   elm: div#app,
//   tag: "vue-component-1-app",
//   componentInstance: {
//     _vnode: {
//       children: [
//         {
//           tag: "div",
//           elm: div,
//           children: [
//             { tag: undefined, text: "Hello sheng_SSU in Browser", elm: text },
//           ],
//         },
//         {
//           tag: "button",
//           elm: button,
//           children: [{ tag: "text", text: "0", elm: text }],
//         },
//       ],
//       elm: div#app,
//       tag: "div",
//     },
//   },
// };

const oldVnode = {
  tag: "div",
  elm: div#app,
  children: [
    {
      tag: "div",
      elm: div,
      children: [
        { tag: undefined, elm: text, text: "Hello sheng_SSU in Browser" },
      ],
    },
    {
      tag: "button",
      elm: button,
      children: [{ tag: undefined, elm: text, text: "0" }],
    },
  ],
};


const vnode = {
  tag: "div",
  elm: undefined,
  children: [
    {
      tag: "div",
      elm: undefined,
      children: [
        { tag: undefined, elm: undefined, text: "Hello sheng_SSU in Browser" },
      ],
    },
    {
      tag: "button",
      elm: undefined,
      children: [{ tag: undefined, elm: undefined, text: "1" }],
    },
  ],
};
