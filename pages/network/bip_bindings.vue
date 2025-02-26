<template>
  <div v-if="bip.length > 0" class="bip-bindings">
    <v-card flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" open elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="bips" resources="bips" :ignore="['action']"></flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>

          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Bindings" open elevation="5">
                <template v-slot:content="{}">
                  <v-container fluid>
                    <v-row no-gutters>
                      <v-col cols="12" class="pa-1">
                        <flo-meta-table @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" :show_title="false" :title="title" :translator="translator" :resources="resources" :hidden_filter="hidden_filter">
                          <template v-slot:edit_path="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <flo-account-select :disabled="edit" v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" persistent-hint />
                            </v-col>
                          </template>
                          <template v-slot:edit_bip_id="{ fmtheader, fmtrow }">
                            <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
                              <v-select v-model="fmtrow.bip_id" :items="bip" :label="fmtheader.text" :disabled="fmtheader.disable_edit" filled item-text="value" item-value="key"></v-select>
                            </v-col>
                          </template>
                        </flo-meta-table>
                      </v-col>
                    </v-row>
                  </v-container>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
  <error-resource v-else-if="!loading && !bip.length" resource="bip" path="/network/bip/"></error-resource>
</template>
<script>
import errorResource from "~/components/error/error-resource.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  head() {
    return {
      title: this.title,
    };
  },
  components: { errorResource },
  data: () => ({
    helpers,
    title: "BIP",
    resources: "bip_bindings",
    translator: null,
    hidden_filter: [],
    edit: false,
    bip: [],
    bips: {},
    bip_id: "",
    loading: true,
  }),
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "aid":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
          case "bip_id":
            {
              header.disable_edit = true;
              header.text = "BIP";
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "path":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    async initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      if (this.$route.query.hasOwnProperty("id")) {
        this.hidden_filter = [
          {
            k: "bip_id",
            op: "equal",
            v: this.$route.query.id,
          },
        ];
        await this.loadBip(translator, this.$route.query.id);
      }
      this.translator = translator;
    },
    async loadBip(translator, id) {
      let bip = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: id,
            },
          ],
        };
        bip = await this.$axios.$post("api/v1/bips/list", query);
        if (bip.length > 0) {
          this.bips = bip[0];
          this.bip = [{ key: this.bips.id, value: this.bips.name }];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      translator.setEnumEx("bip_id", this.bip, true);

      this.loading = false;
    },
    onPreEdit(data) {
      data.record.bip_id = this.bip[0].key;
      this.edit = true;
    },
    onPreNew(data) {
      data.record.bip_id = this.bip[0].key;
      this.edit = false;
    },
  },
};
</script>
