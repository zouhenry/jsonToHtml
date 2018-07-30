<template>
    <a>
        <span slot="label">
            {{label}}
        </span>
        <b-tooltip :label="tooltip">
            <b-icon :icon="icon" :size="size"/>
        </b-tooltip>
    </a>
</template>

<script>
  export default {
    name: "link-tooltip",
    props: {
      label: {type: String},
      tooltip: {type: String},
      icon: {type: String},
      size: {type: String}
    }
  }
</script>