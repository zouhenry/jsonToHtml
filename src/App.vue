<template>
  <div id="app">
    <JsonToHtml />
  </div>
</template>

<script>
import JsonToHtml from './components/jsonToHtml'

export default {
  name: 'app',
  components: {
    JsonToHtml: JsonToHtml
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
