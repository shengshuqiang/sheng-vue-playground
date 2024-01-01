/*
 * 组件内实现 v-model 的方式二（官方推荐）：
 * 将内部原生 <input> 元素的 value attribute 绑定到 modelValue prop;
 * 当原生的 input 事件触发时，触发一个携带了新值的 update:modelValue 自定义事件。
 */
export default {
    name: 'CustomComponent2',
    props: {
        multiple: Number,
        /*
         * 默认情况下，v-model 在组件上都是使用 modelValue 作为 prop，并以 update:modelValue 作为对应的事件。
         * 我们可以通过给 v-model 指定一个参数来更改这些名字。如 “v-model:title="bookTitle"”。
         */
        modelValue: Number,
    },
    // 自定义组件UI模版
    template: `
      <div class="row">
          <span class="red"> {{ multiple }} </span> 倍数：
          <input :value="multipleVal(modelValue)" @input="emitUpdateVal($event.target.value)" />
      </div>
  `,
    setup(props, { emit }) {
        console.log('SSU', 'CustomComponent2 setup(props)', props);
        const { multiple } = props;
        const multipleVal = (val) => {
            const result = multiple * val;
            console.log('SSU', 'CustomComponent2 multipleVal', result, { multiple, val });
            return result;
        }
        const emitUpdateVal = (val) => {
            const result = val / multiple;
            console.log('SSU', 'CustomComponent2 emitUpdateVal', result);
            emit('update:modelValue', result);
        }
        return { multipleVal, emitUpdateVal };
    },
}