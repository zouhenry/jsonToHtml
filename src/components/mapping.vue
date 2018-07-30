<template>
    <tr style="min-height:30px">
        <td>
            <input type="text"
                   class="input"
                   v-model="mapping.source"
                   placeholder="source"/>
        </td>
        <td>
            <input type="text"
                   class="input"
                   v-model="mapping.html"
                   placeholder="html"/>
        </td>
        <td>
            <b-tooltip label="Enable/Disable">
                <a @click="toggleDisabled">
            <span class="is-danger">
               <span v-if="mapping.disabled">
                  <b-icon icon="eye-off-outline"></b-icon>
               </span>
               <span v-else>
                  <b-icon icon="eye-outline"></b-icon>
               </span>
            </span>
                </a>
            </b-tooltip>
            <b-tooltip label="Move Up">
                <a @click="$emit('moveUp',mapping)">
                    <b-icon icon="arrow-up-bold-hexagon-outline"></b-icon>
                </a>
            </b-tooltip>
            <b-tooltip label="Move Down">
                <a @click="$emit('moveDown',mapping)">
                    <b-icon icon="arrow-down-bold-hexagon-outline"></b-icon>
                </a>
            </b-tooltip>
            <b-tooltip label="Delete">
                <a @click="$emit('deleteMapping', mapping)">
                    <b-icon icon="delete" class="is-danger"></b-icon>
                </a>
            </b-tooltip>
        </td>
    </tr>
</template>


<script>
  import Vue from 'vue'

  export default {
    name: 'mapping',
    data() {
      return {}
    },
    props: {
      mapping: {
        isRequired: true
      }
    },
    methods: {
      toggleDisabled() {
        Vue.set(this.mapping, 'disabled', !this.mapping.disabled)
      }
    }
  }
</script>