/*
 * 组件内实现 v-model 的方式一（自以为）：
 * 将内部原生 <input> 元素的 value attribute 绑定到 modelValue prop;
 * 当原生的 input 事件触发时，触发一个携带了新值的 update:modelValue 自定义事件。
 */
export default {
    name: 'CustomComponent1',
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
       <input v-model="innerValue" />
   </div>
  `,
    setup(props, { emit }) {
        const { multiple } = props;
        console.log('SSU', `CustomComponent1(${multiple}) setup(props)`, props);
        const { ref, watch } = Vue;
        const multipleValue = (value) => {
            const result = multiple * value;
            console.log('SSU', `CustomComponent1(${multiple}) multipleValue`, result, { multiple, value });
            return result;
        }
        const emitUpdateValue = (value) => {
            const result = value / multiple;
            console.log('SSU', `CustomComponent1(${multiple}) emitUpdateValue`, result);
            emit('update:modelValue', result);
        }
        const innerValue = ref(multipleValue(props.modelValue));
        watch(() => props.modelValue, (newModelValue, oldModelValue) => {
            console.log('SSU', `CustomComponent1(${multiple}) watch(props.modelValue)`, props.modelValue, { newModelValue, oldModelValue, props });
            innerValue.value = multipleValue(props.modelValue);
        });
        watch(innerValue, (newInnerValue, oldInnerValue) => {
            console.log('SSU', `CustomComponent1(${multiple}) watch(innerValue)`, innerValue.value, { newInnerValue, oldInnerValue, innerValue });
            // 不知道是props改的还是用户输入改的
            emitUpdateValue(newInnerValue);
        });
        return { innerValue };
    },

}