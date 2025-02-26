<template>
  <div class="flo-meta-resource-view">
    <v-container fluid>
      <v-row no-gutters>
        <template v-for="header in dheaders">
          <slot :name="`view_${header.value}`" :fmtheader="header" :fmtrow="value">
            <v-col :key="header.value" cols="12" lg="3" xl="3" class="pa-1">
              <flo-meta-field-view :value="value[header.value]" :header="header" :translator="translator"></flo-meta-field-view>
            </v-col>
          </slot>
        </template>
      </v-row>
    </v-container>
  </div>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-meta-resource-view",
  data: function () {
    return {
      loading: true,
      meta_ready: false,
      dmeta: null,
      dheaders: null,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: [Object],
      required: false,
    },
    meta: {
      type: Object,
      required: false,
    },
    headers: {
      type: Array,
      required: false,
    },
    module: {
      type: String,
      required: false,
    },
    resources: {
      type: String,
      required: true,
    },
    ignore: {
      type: Array,
      required: false,
    },
    translator: {
      type: [Object],
      required: false,
    },
  },
  mixins: [parseNetError, tellUser],
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      if (this.headers) {
        this.dheaders = this.headers;
        this.loading = false;
      } else {
        await this.loadHeaders();
      }
    },
    getResourceUrl() {
      let lurl = "";
      if (typeof this.module !== "undefined") {
        lurl += `${this.module.toLowerCase()}/`;
      }
      lurl += `${this.resources.toLowerCase()}`;

      return lurl;
    },
    getMetaCache(meta_url) {
      let url = this.$router.currentRoute.path;
      if (url === "") {
        return null;
      }

      let lrcache = this.$store.state.session.router_cache;
      let lcache = lrcache[url];

      if (typeof lcache === "undefined") {
        return null;
      }

      if (!lcache.hasOwnProperty("metas")) {
        return null;
      }

      if (!lcache.metas.hasOwnProperty(meta_url)) {
        return null;
      }
      return lcache.metas[meta_url];
    },
    setMetaCache(meta_url, meta) {
      let url = this.$router.currentRoute.path;
      if (url === "") {
        return null;
      }

      let lrcache = this.$store.state.session.router_cache;
      let lcache = lrcache[url];

      if (typeof lcache === "undefined") {
        lcache = {};
        lrcache[url] = lcache;
      }

      if (!lcache.hasOwnProperty("metas")) {
        lcache["metas"] = {};
      }

      if (!lcache.metas.hasOwnProperty(meta_url)) {
        lcache.metas[meta_url] = meta;
      }
      return meta;
    },
    async loadMeta() {
      let lmeta_url = `/api/v1/${this.getResourceUrl()}/meta`;
      let lmeta;

      lmeta = this.getMetaCache(lmeta_url);

      if (lmeta === null) {
        try {
          lmeta = await this.$axios.$get(lmeta_url);
          // add support for non auto id primary keys
          lmeta["primary"] = "id";
          if (lmeta.hasOwnProperty("indexes")) {
            if (lmeta.indexes.hasOwnProperty("primary")) {
              if (lmeta.indexes.primary.length > 0) {
                lmeta["primary"] = lmeta.indexes.primary[0];
              }
            }
          }
          this.setMetaCache(lmeta_url, lmeta);
        } catch (err) {
          let lerr = this.parseNetError(err);
          console.log(`crud table: meta - fail: ${lerr.statusCode} - ${lerr.message}`);
          this.tellUser("error", `${lerr.statusCode} - ${lerr.message}`);

          this.loading = false;
          return;
        }
      }

      this.meta_ready = true;

      return lmeta;
    },
    async loadHeaders() {
      let lmeta = undefined;
      if (!this.meta) {
        lmeta = await this.loadMeta();
      } else {
        lmeta = this.meta;
      }

      let lheaders = [];

      let l__qa = undefined;

      if (lmeta.hasOwnProperty("__qa")) {
        l__qa = lmeta.__qa;
      }

      // build table headers
      for (const key of Object.keys(lmeta.keys)) {
        let lheader = {
          text: "",
          align: "",
          sortable: true,
          value: "",
          type: "",
          pattern: "",
          mask: "",
          auto: false,
          grp: "",
          disable_edit: false,
          disable_new: false,
          view: true,
          edit: true,
          __qa: "",
        };
        lheader.value = key;
        lheader.text = lmeta.keys[key].desc;
        lheader.type = lmeta.keys[key].type;
        lheader.default = lmeta.keys[key].default;
        lheader.pattern = lmeta.keys[key].pattern;

        let hidden_keys = ["ki", "opc", "pin1", "pin2", "puk1", "puk2", "adm"];
        if (hidden_keys.includes(lheader.value)) {
          lheader.type = "password";
        }
        if (lmeta.keys[key].hasOwnProperty("__qa")) {
          lheader.__qa = `${l__qa}@${lmeta.keys[key].__qa}`;
        }
        if (lmeta.keys[key].hasOwnProperty("enum")) {
          lheader["enum"] = lmeta.keys[key].enum;
        }

        if (lmeta.keys[key].hasOwnProperty("tags")) {
          lheader["tags"] = lmeta.keys[key].tags;
        }
        if (lmeta.keys[key].hasOwnProperty("auto")) {
          lheader["auto"] = lmeta.keys[key].auto;
        }
        if (lmeta.keys[key].hasOwnProperty("nullable")) {
          lheader["nullable"] = lmeta.keys[key].nullable;
        }
        if (lmeta.keys[key].hasOwnProperty("min")) {
          lheader["min"] = lmeta.keys[key].min;
        }
        if (lmeta.keys[key].hasOwnProperty("max")) {
          lheader["max"] = lmeta.keys[key].max;
        }
        if (lmeta.keys[key].hasOwnProperty("hint")) {
          lheader["hint"] = lmeta.keys[key].hint;
        }
        lheaders.push(lheader);
      }

      // push action headers
      lheaders.push({
        text: "Actions",
        value: "action",
        sortable: false,
        align: "center",
        type: "action",
        disable_edit: false,
        disable_new: false,
        view: true,
        edit: false,
      });

      // if has attachments
      if (this.attachments) {
        lheaders.push({
          text: "Attachments",
          value: "attach",
          sortable: false,
          align: "center",
          type: "attach",
          disable_edit: this.permissions.u ? false : true,
          disable_new: false,
          view: false,
          edit: true,
        });
      }

      this.dmeta = lmeta;
      if (this.ignore) {
        this.dheaders = lheaders.filter((h) => !this.ignore.includes(h.value));
      } else {
        this.dheaders = lheaders;
      }

      this.loading = false;
    },
  },
};
</script>
