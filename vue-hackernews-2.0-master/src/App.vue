<template>
  <div id="app">
    <div>{{ msg }}</div>
    <button @click="add">{{ count }}</button>
  </div>
</template>

<script>
export default {
  name: "app",
  data: function() {
    return {
      count: 0,
      msg: `Hello!`,
    };
  },
  created: function() {
    console.log(`Vue created`);
    debugger
    this.$store.dispatch("fetchData");
    const name = this.$store.state.name;
    this.msg = `Hello ${name}!`;
  },
  mounted: function() {
    console.log("app mounted");
  },
  methods: {
    add: function() {
      console.log("SSU add()");
      this.count++;
    },
  },
};
</script>
