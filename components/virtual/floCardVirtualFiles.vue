<template>
  <v-container v-if="!loading" fluid class="ma-0 pa-0 flo-card-virtual-files">
    <v-row no-gutters>
      <v-col cols="12" class="pa-1">
        <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :transport="transport" :readonly="readonly" :disabled="disabled" :use_base="false" aid_category="RFM" />
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col cols="12" class="ma-0 pa-0">
        <flo-virtual-tree :tree-data="getFilesTree(vfiles)" :files="true">
          <template v-slot:item="{ item, idx }">
            <slot name="item">
              <flo-card-virtual-file @change="setVf($event)" :vfile="item" :key="idx" :value="value" :uicc="uicc" :operation="getOperationByFile(item)" :parameters="parameters" :readonly="readonly" :disabled="disabled" />
            </slot>
          </template>
        </flo-virtual-tree>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import floCardVirtualFile from "~/components/virtual/floCardVirtualFile.vue";
import floVirtualTree from "~/components/virtual/floVirtualTree";
import floRfmMisc from "~/components/se/floRfmMisc.vue";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-card-virtual-files",
  components: {
    floRfmMisc,
    floVirtualTree,
    floCardVirtualFile,
  },
  data() {
    return {
      loading: true,
      app: "",
      cla: "",
      operations: [],
    };
  },
  props: {
    value: {
      type: [Object, Array],
      default: null,
    },
    uicc: {
      type: Object,
      default: () => {},
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    vfiles: {
      type: [Object, Array],
      default: null,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    parameters: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
    }),
  },
  mixins: [parseNetError, tellUser],
  created() {
    this.initialize();
  },
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    async initialize() {
      console.log(`flo-card-virtual-files - initialize - value - ${JSON.stringify(this.value)}`);
      if (null == this.value) {
        console.log(`flo-card-virtual-files - initialize - value is null`);
      } else {
        this.operations = this.value;
        console.log(`flo-card-virtual-files - initialize - value (operations): ${JSON.stringify(this.operations)}`);
      }
      await this.loadPlmns();
      this.loading = false;
    },
    getOperationByFile(file) {
      let l_at_url = file.url.replace(/\//g, "@");
      let l_file_ref = `/vfile/${l_at_url}`;

      let found = this.operations.find((op) => op.hasOwnProperty("ref") && op.ref == l_file_ref);
      return found;
    },
    getFilesTree(files) {
      let lfiles = files;
      // create root
      let root = {
        gkey: "",
      };

      for (let ih = 0; ih < lfiles.length; ih++) {
        // get next header
        const h = lfiles[ih];
        // point iterator to root
        let it = root;

        // if it has path (i.e. not root header)
        if (h.hasOwnProperty("gpath")) {
          // split the path to branches
          let gpath = h.gpath;
          // console.log(`flo-card-virtual-files: getFieldsTree - gpath - ${JSON.stringify(gpath)}`);
          let gpath_arr = gpath.split("/");
          // console.log(`flo-card-virtual-files: getFieldsTree - gpath_arr - ${JSON.stringify(gpath_arr)}`);

          // traverse over the branches
          // "" is the root
          // "", "sub1", "sub2"

          const lbranches = gpath_arr.length;
          for (let igbk = 0; igbk < lbranches; igbk++) {
            // get branch key
            const lgbk = gpath_arr[igbk];

            // console.log(`flo-card-virtual-files: getFieldsTree - lgbk - ${lgbk}`);

            if (it.gkey == lgbk) {
              // console.log(`flo-card-virtual-files: getFieldsTree - lgbk - ${lgbk} - continue`);
              continue;
            }

            // console.log(`flo-card-virtual-files: getFieldsTree - it - ${JSON.stringify(it)}`);

            // create children if needed
            if (!it.hasOwnProperty("children")) {
              // console.log(`flo-card-virtual-files: getFieldsTree - lgbk - ${lgbk} has no children .. create`);
              it["children"] = [];
            }

            // get children
            let children = it["children"];

            // find gkey
            let founds = children.filter((c) => c.gkey == lgbk);
            if (founds.length > 0) {
              it = founds[0];
            } else {
              it = { gkey: lgbk };
              children.push(it);
            }
          }
        }

        if (!it.hasOwnProperty("items")) {
          it["items"] = [];
        }

        it.items.push(h);
      }

      return root;
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    async loadPlmns() {
      let plmns = this.getResourceKey("main", "operators", "plmns");

      if (!plmns) {
        let operators = await this.loadOperators();

        let items = operators.map((o) => {
          return { key: o.mccmnc, value: `${o.mccmnc} - ${o.country}, ${o.name}` };
        });

        plmns = items;
        this.addToResourceCache({ module: "main", resource: "operators", key: "plmns", expire: 1500, value: plmns });
      }

      return plmns;
    },
    async loadOperators() {
      let operators = this.getResourceKey("main", "operators", "table");
      if (!operators) {
        try {
          let query = {
            select: {},
          };

          operators = await this.$axios.$post("api/v1/operators/list", query);
          this.addToResourceCache({ module: "main", resource: "operators", key: "table", expire: 1500, value: operators });
          return operators;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
          return [];
        }
      }

      return [];
    },
    setVf(event) {
      console.log(`flo-card-virtual-files - setVf - enter`);
      if (!event) {
        console.log(`flo-card-virtual-files - setVf - no event`);
      }

      console.log(`flo-card-virtual-files - setVf - event: ${JSON.stringify(event)}`);
      console.log(`flo-card-virtual-files - setVf - operations: ${JSON.stringify(this.operations)}`);
      let l_existing_op = this.operations.find((op) => op.ref == event.ref);
      console.log(`flo-card-virtual-files - setVf - found: ${JSON.stringify(l_existing_op)}`);

      if (!event.hasOwnProperty("fields") || event.fields.length == 0) {
        console.log(`flo-card-virtual-files - setVf - no fields`);

        if (!l_existing_op) {
          console.log(`flo-card-virtual-files - setVf - not existing - l_existing_op`);
          return;
        }

        // remove file from operation list
        let ops_left = this.operations.filter((op) => op.ref != l_existing_op.ref);
        if (ops_left == null) {
          this.operations = [];
        } else {
          this.operations = ops_left;
        }

        console.log(`flo-card-virtual-files - setVf - no fields - operations: ${JSON.stringify(this.operations)}`);
        this.syncParent();
        return;
      }

      if (!l_existing_op) {
        // file wasnt used before
        this.operations.push(event);
      } else {
        // just update the fields
        l_existing_op.fields = event.fields;
      }

      console.log(`flo-card-virtual-files - setVf - has fields - operations: ${JSON.stringify(this.operations)}`);
      this.syncParent();
    },
    syncParent() {
      if (this.operations.length > 0) {
        this.operations.forEach((operation) => {
          operation["app"] = this.app;
          operation["cla"] = this.cla;
        });
      }
      this.$emit("change", this.operations);
    },
    onMiscChange(event) {
      if (event) {
        this.app = event.app;
        this.cla = event.cla;
      } else {
        this.app = "";
        this.cla = "";
      }

      this.syncParent();
    },
  },
};
</script>
