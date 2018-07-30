<template>
    <tr>
        <td>
            <input type="text"
                   class="input"
                   v-model="transformer.path"
                   placeholder="source"/>
        </td>
        <td>
            <div class="control">
         <span class="select">
            <select placeholder="Select a method"
                    v-model="transformer.method">
               <option v-for="(method, index) in methods"
                       :key="index"
                       :value="method">{{method}}
               </option>
            </select>
         </span>
            </div>
        </td>
        <td>
      <textarea class="textarea"
                rows="1"
                v-model="transformer.params"
                placeholder="params"/>
        </td>
        <td>
            <b-tooltip label="Enable/Disable">
                <a @click="transformer.disabled = !transformer.disabled;">
            <span class="is-danger">
               <span v-if="transformer.disabled">
                  <b-icon icon="eye-off-outline"></b-icon>
               </span>
               <span v-else>
                  <b-icon icon="eye-outline"></b-icon>
               </span>
            </span>
                </a>
            </b-tooltip>
            <b-tooltip label="Move Up">
                <a @click="$emit('moveUp',transformer)">
                    <b-icon icon="arrow-up-bold-hexagon-outline"></b-icon>
                </a>
            </b-tooltip>
            <b-tooltip label="Move Down">
                <a @click="$emit('moveDown',transformer)">
                    <b-icon icon="arrow-down-bold-hexagon-outline"></b-icon>
                </a>
            </b-tooltip>
            <b-tooltip label="Delete">
                <a href="#" @click="$emit('deleteTransformer', transformer)">
                    <b-icon icon="delete" class="is-danger"></b-icon>
                </a>
            </b-tooltip>
        </td>
    </tr>
</template>


<script>
  import methods from './methods';

  export default {
    name: 'transformer',
    data() {
      return {
        methods: methods
      }
    },
    props: {
      transformer: {
        isRequired: true
      }
    }
  }
</script>