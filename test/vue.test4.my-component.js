// 定义一个组件 https://cn.vuejs.org/guide/essentials/component-basics.html#defining-a-component
// my-component.js
import { ref } from 'vue'
export default {
    setup() {
        const count = ref(0)
        return { count }
    },
    template: `<div>count is {{ count }}</div>`
    // 也可以针对一个 DOM 内联模板：
    // template: '#my-template-element'
}