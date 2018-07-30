<template>

    <section>
        <b-collapse class="panel" :open.sync="isJSONOpen">
            <div slot="trigger" class="panel-heading">
                <strong>JSON Code</strong>
            </div>
            <div class="panel-block">
                <b-field class="full-width" label="JSON Object to transform">
                    <textarea class="textarea" rows="20" type="textarea" v-model="source"></textarea>
                </b-field>
            </div>
        </b-collapse>

        <b-collapse class="panel" :open.sync="isConfigOpen">
            <div slot="trigger" class="panel-heading">
                <strong>Configuration</strong>
                &nbsp;
                <span class="control">
                    <a @click.prevent.stop="saveConfig">
                        <b-tooltip label="Save to disk">
                            <b-icon icon="content-save"/>
                        </b-tooltip>
                    </a>
                </span>

                <b-upload v-model="file">
                    <link-tooltip tooltip="Upload config"
                                  icon="folder-upload">
                    </link-tooltip>
                </b-upload>

                <span class="control">
                    <a @click.prevent.stop="clearConfig">
                        <b-tooltip label="Start a new config">
                            <b-icon icon="close"/>
                        </b-tooltip>
                    </a>
                </span>
            </div>

            <b-field label="Path to the base array">
                <input placeholder="Path to the array"
                       class="input" v-model="path"/>
            </b-field>
            <hr/>
            <div class="level" style="padding:20px; align-items: flex-start;">
                <div class="level-left"
                     style="border-right: 1px dotted gray; padding-right: 35px; width: 70%; flex-direction: column; justify-items: flex-end">
                    <div class="full-width">
                        <button style="float:right" class="button is-primary "
                                @click="addTransformer">
                            <b-icon icon="plus" size="is-small"></b-icon>
                            Add Transformer
                        </button>
                    </div>
                    <table class="full-width has-input table is-striped has-mobile-cards is-hoverable">
                        <thead>
                        <tr>
                            <th is="thWTooltip"
                                style="width:25%"
                                label="Path"
                                tooltip="Object path from the base object: used by _.get()"
                                icon="information-outline">
                            </th>

                            <th is="thWTooltip"
                                style="width:20%"
                                label="Method"
                                tooltip="Compatible with lodash's methods. See: https://lodash.com/docs/4.17.10"
                                icon="information-outline">
                            </th>

                            <th is="thWTooltip"
                                label="Params"
                                tooltip="takes value or function. e.g. 'type' or function(item) {item.name === 'filtered'})"
                                icon="information-outline">
                            </th>

                            <th width="125px"></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr is="transformer"
                            v-for="(transformer, index) in config.transformers"
                            :transformer="transformer"
                            :key="index"
                            @moveUp="moveUp"
                            @moveDown="moveDown"
                            @deleteTransformer="deleteTransformer">
                        </tr>
                        </tbody>
                    </table>

                </div>

                <div class="level-right" style="flex-direction: column;">
                    <div class="full-width">
                        <button style="float:right"
                                class="button is-primary"
                                @click="addMapper">
                            <b-icon icon="plus" size="is-small"></b-icon>
                            Add Mapping
                        </button>
                    </div>
                    <table class="full-width has-input table is-striped has-mobile-cards is-hoverable">
                        <thead>
                        <tr>
                            <th is="thWTooltip"
                                label="Path"
                                tooltip="Object path from the base object: used by _.get()"
                                icon="information-outline">
                            </th>

                            <th is="thWTooltip"
                                label="Table Header"
                                tooltip="Table header to display"
                                icon="information-outline">
                            </th>

                            <th width="125px"></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr is="mapping" v-for="(mapping, index) in config.mappings"
                            @deleteMapping="deleteMapping"
                            @moveUp="moveMappingUp"
                            @moveDown="moveMappingDown"
                            :mapping="mapping"
                            :key="index"
                            style="min-height:30px">
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </b-collapse>

        <b-collapse class="panel" :open.sync="isResultOpen">
            <div slot="trigger" class="panel-heading">
                <strong>OUTPUT</strong>
            </div>
            <div class="panel-block " ref="output">
                <table class="full-width table is-striped has-mobile-cards is-hoverable">
                    <thead>
                    <tr>
                        <th v-for="(mapping, index) in enabledMappings" :key="index">
                            {{mapping.html}}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, index) in json" :key="index">
                        <td v-for="(mapping, index) in enabledMappings" :key="index" :title="getVal(row, mapping)">
                            {{getVal(row, mapping)}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </b-collapse>

        <b-collapse class="panel" :open.sync="isSourceCodeOpen">
            <div slot="trigger" class="panel-heading">
                <strong>SOURCE CODE</strong>
                &nbsp;
                <span class="control">
                    <a @click.prevent.stop="copySource">
                        <b-tooltip label="Copy to clipboard">
                            <b-icon icon="content-copy"/>
                        </b-tooltip>
                    </a>
                </span>
                <span class="control">
                    <a @click.prevent.stop="saveHtml">
                        <b-tooltip label="SaveAs HTML page">
                            <b-icon icon="content-save"/>
                        </b-tooltip>
                    </a>
                </span>
            </div>
            <div class="panel-block">
                <pre class="full-width">{{sourceCode}}</pre>
                <textarea id="sourceHtml"
                          style="left:-1000px; top: -1000px; position:fixed"
                          ref="offScreenSourceCode"
                          v-model="sourceCode">
                </textarea>
            </div>
        </b-collapse>
    </section>
</template>

<script>
  import _ from 'lodash';
  import pretty from 'pretty';
  import FileSaver from 'file-saver'
  import Mapping from './mapping'
  import Transformer from './transformer'
  import thWTooltip from './thWTooltip'
  import LinkTooltip from "./linkTooltip";
  import data from './data.json';

  export default {
    name: 'HelloWorld',
    components: {LinkTooltip, Transformer, Mapping, thWTooltip},
    data() {
      return {
        file: [],
        isJSONOpen: true,
        isConfigOpen: true,
        isResultOpen: true,
        isSourceCodeOpen: true,
        processed: true,
        path: '',
        htmlSourceCode: '',
        source: JSON.stringify(data, null, 2),
        config: JSON.parse(window.localStorage.getItem('jsonHtmlReport') || '{}')
      }
    },
    mounted() {
      this.setHtmlSourceCode();
    },
    watch: {
      file: {
        handler(newVal, oldVal) {
          if (newVal !== oldVal) {
            this.loadConfigFromFile(newVal[0]);
          }
        }
      },
      source: {
        handler() {
          this.setHtmlSourceCode();
        }
      },
      config: {
        handler() {
          this.setHtmlSourceCode();
        },
        deep: true
      }
    },
    computed: {
      _() {
        return _;
      },
      enabledMappings() {
        return _.filter(this.config.mappings, (mapping) => !mapping.disabled);
      },
      sourceCode() {
        return pretty(`<!DOCTYPE html><html lang="en"><body>${this.htmlSourceCode}</body></html>`);
      },
      json() {
        if (this.source == '') return [];

        let source = JSON.parse(this.source) || [];
        source = _.get(source, this.path, source);
        _.each(this.config.transformers, (transformer) => {

          let value = source;
          let pathParts = transformer.path.split('=>');
          let path = pathParts[0];
          let dest = pathParts[1] || pathParts[0];

          if (transformer.method && transformer.params && !transformer.disabled) {

            if (path.endsWith('.')) {
              path = path.substring(0, path.length - 1);
              value = path ? _.get(source, path) : source;
              let predicate;
              try {
                eval('predicate = ' + transformer.params);

                if (transformer.method === 'set') {
                  value = _.isFunction(predicate) ? predicate(value, source) : predicate;
                } else {
                  value = _[transformer.method](value, predicate);
                }

                if (dest.endsWith('.')) {
                  dest = dest.substring(0, dest.length - 1);
                }
                dest ? _.set(source, dest, value) : (source = value);
              } catch (e) {
                //ignore
              }
            } else {

              _.each(source, (item, key, rowIndex) => {
                value = _.get(item, path);
                let predicate;
                try {
                  eval('predicate = ' + transformer.params);

                  if (transformer.method === 'set') {
                    value = _.isFunction(predicate) ? predicate(value, item, rowIndex) : predicate;
                  } else {
                    value = _[transformer.method](value, predicate);
                  }
                  _.set(item, dest, value);
                } catch (e) {
                  //ignore
                }
              });
            }
          }

          return value;

        });
        return source;
      }
    },
    methods: {
      clearConfig() {
        this.config = {
          transformers: [],
          mappings: []
        }
      },
      moveUp(transformer) {
        let index = _.indexOf(this.config.transformers, transformer);
        let item = this.config.transformers[index];
        this.config.transformers.splice(index, 1);
        this.config.transformers.splice(index - 1, 0, item);
        this.$toast.open({message: 'Transformer moved!', type: 'is-success'})
      },
      moveDown(transformer) {
        let index = _.indexOf(this.config.transformers, transformer);
        let item = this.config.transformers[index];
        this.config.transformers.splice(index, 1);
        this.config.transformers.splice(index + 1, 0, item);
        this.$toast.open({message: 'Transformer moved!', type: 'is-success'})
      },
      moveMappingUp(mapping) {
        let index = _.indexOf(this.config.mappings, mapping);
        let item = this.config.mappings[index];
        this.config.mappings.splice(index, 1);
        this.config.mappings.splice(index - 1, 0, item);
        this.$toast.open({message: 'Mapping moved!', type: 'is-success'})
      },
      moveMappingDown(mapping) {
        let index = _.indexOf(this.config.mappings, mapping);
        let item = this.config.mappings[index];
        this.config.mappings.splice(index, 1);
        this.config.mappings.splice(index + 1, 0, item);
        this.$toast.open({message: 'Mapping moved!', type: 'is-success'})
      },
      deleteTransformer(transformer) {
        let index = _.indexOf(this.config.transformers, transformer);
        this.config.transformers.splice(index, 1);
        this.$toast.open({message: 'Transformer deleted!', type: 'is-success'})
      },
      deleteMapping(mapping) {
        let index = _.indexOf(this.config.mappings, mapping);
        this.config.mappings.splice(index, 1);
        this.$toast.open({message: 'Mapping deleted!', type: 'is-success'})
      },
      setHtmlSourceCode() {
        _.delay(() => {
          let htmlSourceCode = _.get(this, '$refs.output.innerHTML', '');
          this.htmlSourceCode = htmlSourceCode;
          window.localStorage.setItem('jsonHtmlReport', JSON.stringify(this.config));
        });
      },
      copySource() {
        /* Copy the text inside the text field */
        this.$refs.offScreenSourceCode.select();
        document.execCommand("copy");

        this.$toast.open({message: 'Source code copied to clipboard!', type: 'is-success'})
      },
      getVal(row, mapping) {
        return _.get(row, mapping.source);
      },
      addMapper() {
        this.config.mappings.push({source: '', html: ''});
      },
      addTransformer() {
        this.config.transformers.push({path: '', method: '', params: '\'\'', disabled: false});
      },
      saveConfig() {
        let blob = new Blob([JSON.stringify(this.config)], {type: "text/plain;charset=utf-8"});
        FileSaver.saveAs(blob, "jsonToHtml.config");
      },
      saveHtml() {
        let blob = new Blob([this.htmlSourceCode], {type: "text/html;charset=utf-8"});
        FileSaver.saveAs(blob, "jsonHtmlReport.html");
      },
      loadConfigFromFile(file) {
        let reader = new FileReader();

        reader.onload = () => {
          let config = reader.result;
          try {
            this.config = JSON.parse(config);
            this.$toast.open({message: 'Config uploaded', type: 'is-success'})
          } catch (e) {
            this.$toast.open({message: 'Uploading failed', type: 'is-danger'})
          }
        };

        reader.readAsText(file, "text/plain;charset=utf-8");
      }
    }
  }
</script>

<style>
    table.has-input input {
        padding: 0.5rem .25rem;
        font-size: 0.875rem;
    }

    table.has-input textarea {
        padding: 0.5rem .25rem;
        font-size: 0.875rem;
    }

    .full-width {
        width: 100%;
    }
</style>