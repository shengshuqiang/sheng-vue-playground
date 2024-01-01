const DIYVue = ((exports) => {
    let containerOrSelector = null;
    /** 初始化容器挂载节点选择器，如"#app" */
    const init = (containerSelector) => {
        containerOrSelector = containerSelector;
        return exports;
    };
    /** 更新 DOM */
    const update = () => {
        if (!containerOrSelector) {
            console.warn('DIYVue未初始化containerOrSelector，更新功能失效');
            return;
        }
        const app = document.querySelector(containerOrSelector).__vue_app__;
        if (!app) {
            console.warn('bindApp返回app失效，更新功能失效');
            return;
        }
        const { _instance } = app;
        // 更新模版内容
        _instance && _instance.update();
    };
    // 已准备好的副作用集合，在下个微任务中执行，会去掉重复副作用，确保副作用不管触发了多少次，最多只会被执行一次
    const readyEffectSet = new Set();
    const resolvedPromise = Promise.resolve();
    const queueFlush = () => {
        console.log("queueFlush ready", readyEffectSet.length, readyEffectSet);
        // 非空时第一个触发
        if (readyEffectSet.size === 1) {
            resolvedPromise.then(() => {
                console.log('queueFlush go', readyEffectSet.length, readyEffectSet);
                if (readyEffectSet.size) {
                    readyEffectSet.forEach((effect) => (effect()));
                    readyEffectSet.clear();
                }
            }).then(update);
        }
    }
    // 【画龙点睛之笔】标记当前生效副作用
    let activeEffect;
    // reactiveObj副作用订阅存储表（WeakMap<target, Map<key, Set<effect>>>）
    const reactiveObj2EffectSetMapMap = new WeakMap();
    /** 追踪refObj，在属性get时调用 */
    const trackRefValue = (refObj) => {
        console.log("trackRefValue", activeEffect, { refObj });
        if (activeEffect) {
            // 找到value属性对应的副作用订阅集合
            let { deps } = refObj;
            if (!deps) {
                refObj.deps = (deps = new Set());
            }
            if (!deps.has(activeEffect)) {
                deps.add(activeEffect);
            }
            console.log("trackRefValue activeEffect", { deps });
        }
    };
    /** 触发refObj，在属性set时调用 */
    const triggerRefValue = (refObj, newVal) => {
        // 找到value属性对应的副作用订阅集合
        const { deps } = refObj;
        console.log("triggerRefValue", deps, { refObj, newVal });
        if (deps) {
            deps.forEach((effect) => {
                if (!readyEffectSet.has(effect)) {
                    readyEffectSet.add(effect);
                    // effect准备队列非空，触发下个微任务执行effect准备队列
                    queueFlush();
                }
            });
        }
        update();
    };
const ref = (value) => ({
    // 加上这个标识，模版中直接对ref对象obj解包为obj.value
    __v_isRef: true,
    // 存储了value属性关联副作用集合
    dep: null,
    _value: (value === null || typeof value !== "object") ? value : reactive(value),
    get value() {
        console.log("ref(value) get value()", { value: this._value });
        trackRefValue(this);
        return this._value;
    },
    set value(newValue) {
        console.log("ref(value) set value()", { oldValue: this._value, newValue });
        if (!Object.is(newValue, this._value)) {
            this._value = newValue;
            triggerRefValue(this, newValue);
        }
    },
});
/** 追踪reactiveObj，在属性get时调用 */
const trackReactiveObj = (target, key) => {
    console.log("trackReactiveObj", activeEffect, { target, key });
    if (activeEffect) {
        // 小知识点，WeakMap可以使用Object作为key（不同Object key不一样），如果直接使用Object作为Map，不同Object对应的key是一样的。
        // 找到目标对象对应的副作用订阅对象
        let effectSetMap = reactiveObj2EffectSetMapMap.get(target);
        if (!effectSetMap) {
            reactiveObj2EffectSetMapMap.set(target, (effectSetMap = new Map()));
        }
        // 找到目标属性对应的副作用订阅集合
        let effectSet = effectSetMap.get(key);
        if (!effectSet) {
            effectSetMap.set(key, (effectSet = new Set()));
        }
        if (!effectSet.has(activeEffect)) {
            effectSet.add(activeEffect);
        }
        console.log("trackReactiveObj activeEffect", effectSet, { effectSetMap, reactiveObj2EffectSetMapMap });
    }
};
/** 触发reactiveObj，在属性set时调用 */
const triggerReactiveObj = (target, key) => {
    const effectSetMap = reactiveObj2EffectSetMapMap.get(target);
    const effectSet = effectSetMap ? effectSetMap.get(key) : null;
    console.log("triggerReactiveObj", effectSet, { target, key, effectSetMap, reactiveObj2EffectSetMapMap });
    if (effectSet && effectSet.size) {
        effectSet.forEach((effect) => {
            if (!readyEffectSet.has(effect)) {
                readyEffectSet.add(effect);
                // effect准备队列非空，触发下个微任务执行effect准备队列
                queueFlush();
            }
        });
    }
    update();
};

// reactiveObj代理表，创建reactiveObj前先查询是否在表里面，有直接返回，对应reactive创建同一对象生成的reactiveObj相同
const reactiveObjProxyMap = new WeakMap();
const reactive = (val) => {
    if (val === null || typeof val !== "object") {
        console.warn(`${val}不是对象，reactive响应式创建失败，原值返回`);
        return val;
    }
    if (reactiveObjProxyMap.has(val)) {
        return reactiveObjProxyMap.get(val);
    }
    const handler = {
        get(target, key) {
            const res = target[key];
            console.log("reactive Proxy get(target, key)", { res, target, key });
            trackReactiveObj(target, key);
            return res;
        },
        set(target, key, newValue) {
            if (!Object.is(newValue, target[key])) {
                target[key] = newValue;
                triggerReactiveObj(target, key);
                // 返回 true 代表属性设置成功
                return true;
            }
            // 在严格模式下，返回 false 会抛出一个 TypeError 异常
            return false;
        }
    };
    const result = new Proxy(val, handler);
    reactiveObjProxyMap.set(val, result);
    return result;
};
    const computed = (effectFunc) => {
        console.log("computed(effectFunc)", { effectFunc });
        // 这是众妙之门，如此使用则后续只需要调用副作用函数effect即可完成refValue重置，而不需要全局找到result
        // 啥是闭包？这才是闭包！
        const result = ref();
        const effect = () => {
            // 执行副作用函数effectFunc()前将activeEffect赋值为effect函数
            activeEffect = effect;
            result.value = effectFunc();
            // 执行副作用函数effectFunc()后将activeEffect清空
            activeEffect = null;
            console.log("computed(effectFunc) effect()", { result });
        };
        effect();
        return result;
    };

    exports.init = init;
    exports.ref = ref;
    exports.reactive = reactive;
    exports.computed = computed;
    return exports;
})({});