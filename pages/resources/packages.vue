<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :translator="translator" :resources="resources" main_resource>
      <template v-slot:view_package="{ fmtrow }">
        <v-chip label color="info">{{ fmtrow.package }}</v-chip>
      </template>

      <template v-slot:edit_path="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :disabled="!fmtpermissions.u" :hint="fmtheader.hint" persistent-hint />
        </v-col>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resource: "package",
    resources: "packages",
    translator: null,
  }),
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "aid":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
    async initialize() {
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      await this.loadAccountName(translator);
      this.translator = translator;
    },
    async loadAccountName(translator) {
      try {
        let aname = await this.$axios.$post("api/v1/accounts/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("aname", aname);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
