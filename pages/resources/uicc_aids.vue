<template>
  <div>
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" :show_title="false" :translator="translator" :resources="resources" :hidden_filter="hidden_filter">
      <template v-slot:edit_uicc_id="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
          <v-select v-model="fmtrow.uicc_id" :items="uicc" :label="fmtheader.text" :disabled="fmtheader.disable_edit" filled item-text="value" item-value="key"></v-select>
        </v-col>
      </template>
      <template v-slot:edit_uaid="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6" xl="6">
          <flo-aid v-model="fmtrow.uaid" :header="fmtheader" :pattern="fmtheader.pattern" />
        </v-col>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import floMetaTable from "~/components/crud/floMetaTable.vue";
import parseNetError from "~/mixins/parseNetError.js";
import floAid from "~/components/se/floAid.vue";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resources: "uicc_aids",
    resource: "uicc_aid",
    translator: null,
    hidden_filter: [],
    uicc: [],
  }),
  components: {
    floMetaTable,
    floAid,
  },
  mixins: [tellUser, parseNetError],
  async created() {
    await this.initialize();
  },
  methods: {
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "uicc_id":
            {
              header.disable_edit = true;
            }
            break;
        }
      }
    },
    async initialize() {
      this.hidden_filter = [
        {
          k: "uicc_id",
          op: "equal",
          v: this.$route.query.id,
        },
      ];
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      await this.loadUiccName(translator, this.$route.query.id);
      this.translator = translator;
    },
    async loadUiccName(translator, id) {
      let uname = [];
      try {
        let query = {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
          where: [
            {
              k: "id",
              op: "equal",
              v: id,
            },
          ],
        };
        uname = await this.$axios.$post("api/v1/uiccs/list", query);
        this.uicc = uname;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      translator.setEnumEx("uicc_id", uname, true);
    },
    onPreEdit(data) {
      data.record.uicc_id = this.uicc[0].key;
      this.edit = true;
    },
    onPreNew(data) {
      data.record.uicc_id = this.uicc[0].key;
      this.edit = false;
    },
  },
};
</script>
