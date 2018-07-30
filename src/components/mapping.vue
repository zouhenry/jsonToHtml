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
            <b-tooltip label="Delete">
                <a href="#" @click="$emit('deleteMapping', mapping)">
                    <b-icon icon="delete" class="is-danger"></b-icon>
                </a>
            </b-tooltip>
        </td>
    </tr>
</template>


<script>

  export default {
    name: 'mapping',
    data() {
      return {}
    },
    props: {
      mapping: {
        isRequired: true
      }
    }
  }
</script>