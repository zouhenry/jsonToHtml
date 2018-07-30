<template>
    <th>{{label}}
        <link-tooltip :tooltip="tooltip" :icon="icon" :label="linkText" size="is-small"></link-tooltip>
    </th>
</template>

<script>
  import linkTooltip from './linkTooltip';

  export default {
    name: "th-with-tooltip",
    components: {linkTooltip},
    props: ['label', 'linkText', 'tooltip', 'icon', 'size', 'action']
  }
</script>

<style scoped>

</style>