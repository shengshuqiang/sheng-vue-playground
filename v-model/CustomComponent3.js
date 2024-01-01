/*
 * 组件内实现 v-model 的方式三（官方推荐）：
 * 使用一个可写的，同时具有 getter 和 setter 的 computed 属性。
 * get 方法需返回 modelValue prop，而 set 方法需触发一个携带了新值的 update:modelValue 自定义事件。
 */
export default {
    name: 'CustomComponent3',
    props: {
        multiple: Number,
        modelValue: Number,
    },
    // 自定义组件UI模版
    template: `
      <div class="row">
          <span class="red"> {{ multiple }} </span> 倍数：
          <input :value="computedRefCount" @input="handlerInputEvent" />
      </div>
  `,
    setup(props, { emit }) {
        console.log('SSU', 'CustomComponent3 setup(props)', props);
        const { computed, toRef } = Vue;
        const { multiple } = props;
        const valRef = toRef(props, 'modelValue');
        // TODO 这是什么写法，computed 参数直接传对象
        const computedRefCount = computed({
            get() {
                /*
                 * 问：为什么直接解构 props 返回 val 会丢失响应性？
                 * 答：props 是 Proxy(Object)，即 props 对象本身才有响应性（通过 props 访问会被追踪到），解构后存储到了普通的 Number 变量，无响应性。
                 * 解决方式有两种：
                 * 一种是不解构，直接使用 props.modelValue 访问。如 “return multiple * props.modelValue;"；
                 * 另一种是使用 toRef 使得解构后存储到了响应式 ObjectRefImpl 变量。如 “const valRef = toRef(props, 'modelValue'); return multiple * valRef.value;”
                 */
                // const result = multiple * props.modelValue;
                const result = multiple * valRef.value;
                console.log('SSU', 'CustomComponent3 computedRefCount get()', result, { multiple, modelValue: props.modelValue, valRef });
                return result;
            },
            set(value) {
                const result = value / multiple;
                console.log('SSU', 'CustomComponent3 computedRefCount set()', result, { multiple, value });
                emit('update:modelValue', result);
            }
        });
        const handlerInputEvent = (event) => {
            console.log('SSU', 'CustomComponent3 handlerInputEvent', event);
            computedRefCount.value = event.target.value;
        }
        console.log('SSU', 'CustomComponent3 setup(props) end', { computedRefCount });
        return { computedRefCount, handlerInputEvent }
    },
}