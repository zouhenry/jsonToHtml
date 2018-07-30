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
                <span class="control">
                    ( <a @click.prevent.stop="saveConfig"><span>
                    <b-icon icon="content-save" size="is-small"></b-icon>
                    Save Config</span></a> )
                </span>
                ( <b-upload v-model="file">
                    <b-icon icon="folder-upload" size="is-small"></b-icon>
                    <a><span>Upload Config</span></a>
                </b-upload> )
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
                            <th style="width:25%">Path
                                <b-tooltip
                                        label="Object path from the base object: used by _.get()">
                                    <a>
                                        <b-icon icon="information-outline" size="is-small"/>
                                    </a>
                                </b-tooltip>
                            </th>
                            <th style="width:20%">Method
                                <b-tooltip
                                        label="Compatible with lodash's methods. See: https://lodash.com/docs/4.17.10">
                                    <a>
                                        <b-icon icon="information-outline" size="is-small"/>
                                    </a>
                                </b-tooltip>
                            </th>
                            <th>Params
                                <b-tooltip
                                        label="takes value or function. e.g. 'type' or function(item) {item.name === 'filtered'})">
                                    <a>
                                        <b-icon icon="information-outline" size="is-small"/>
                                    </a>
                                </b-tooltip>
                            </th>
                            <th></th>
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
                            <th>Path
                                <b-tooltip
                                        label="Object path fro the base object: used by _.get()">
                                    <a>
                                        <b-icon icon="information-outline" size="is-small"/>
                                    </a>
                                </b-tooltip>
                            </th>
                            <th>Table Header
                                <b-tooltip label="Table header to display">
                                    <a>
                                        <b-icon icon="information-outline" size="is-small"/>
                                    </a>
                                </b-tooltip>
                            </th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr is="mapping" v-for="(mapping, index) in config.mappings"
                            @deleteMapping="deleteMapping"
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
                        <th v-for="(mapping, index) in config.mappings" :key="index">
                            {{mapping.html}}
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="(row, index) in json" :key="index">
                        <td v-for="(mapping, index) in config.mappings" :key="index">
                            {{getVal(row, mapping)}}
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        </b-collapse>

        <b-collapse class="panel" :open.sync="isSourceCodeOpen">
            <div slot="trigger" class="panel-heading">
                <strong>SOURCE CODE</strong>&nbsp;( <a href="#" @click.stop.prevent="copySource">
                <b-icon icon="content-copy" size="is-small"></b-icon>
                copy</a> )
                <span class="control">
                    ( <a @click.prevent.stop="saveHtml"><span>
                    <b-icon icon="content-save" size="is-small"></b-icon>
                    Save Page</span></a> )
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

  export default {
    name: 'HelloWorld',
    components: {Transformer,Mapping},
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
        source: '',
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
      sourceCode() {
        return pretty(`<!DOCTYPE html><html lang="en"><body>${this.htmlSourceCode}</body></html>`);
      },
      json() {
        if (this.source == '') return [];

        let source = JSON.parse(this.source) || [];
        source = _.get(source, this.path, source);
        _.each(this.config.transformers, (transformer) => {

          let value = source;
          if (transformer.method && transformer.params && !transformer.disabled) {
            _.each(source, (item, rowIndex) => {
              value = _.get(item, transformer.path);
              let predicate;
              try {
                eval('predicate = ' + transformer.params);

                if (transformer.method === 'set') {
                  value = _.isFunction(predicate) ? predicate(value, item, rowIndex) : predicate;
                } else {
                  value = _[transformer.method](value, predicate);
                }
                _.set(item, transformer.path, value);
              } catch (e) {
                //ignore
              }
            });
          }
          return value;

        });
        return source;
      }
    },
    methods: {
      moveUp(transformer) {
        let index = this.getRowIndex(transformer);
        let item = this.config.transformers[index];
        this.config.transformers.splice(index, 1);
        this.config.transformers.splice(index - 1, 0, item);
        this.$toast.open({message: 'Transformer moved!', type: 'is-success'})
      },
      moveDown(transformer) {
        let index = this.getRowIndex(transformer)
        let item = this.config.transformers[index];
        this.config.transformers.splice(index, 1);
        this.config.transformers.splice(index + 1, 0, item);
        this.$toast.open({message: 'Transformer moved!', type: 'is-success'})
      },
      getRowIndex(transformer) {
        return _.indexOf(this.config.transformers, transformer);
      },
      deleteTransformer(transformer) {
        let index = this.getRowIndex(transformer);
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