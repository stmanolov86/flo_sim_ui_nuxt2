<template>
  <div class="flo-rfs">
    <flo-expand open :title="`${lso.length} Files`" elevation="0">
      <template v-slot:content="{}">
        <v-container fluid>
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-file-input :accept="accept" label="Upload" :clearable="false" @change="addResourceFile($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" show-size counter></v-file-input>
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <v-list>
                <v-list-item v-for="(file, idx) in lso" :key="idx">
                  <v-list-item-avatar>
                    <v-icon :color="displayIcon(file.fname).color">
                      {{ displayIcon(file.fname).icon }}
                    </v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>{{ formatName(file.fname) }}</v-list-item-title>
                    <v-list-item-subtitle>{{ helpers.toLocalTimeInIsoFormatUi(file.ts) }}</v-list-item-subtitle>
                  </v-list-item-content>

                  <v-list-item-action>
                    <v-row>
                      <v-btn icon @click="downloadResourceFile(file)">
                        <v-icon color="success">mdi-download</v-icon>
                      </v-btn>
                      <v-btn icon @click="deleteResourceFile(file)">
                        <v-icon color="error">mdi-delete</v-icon>
                      </v-btn>
                    </v-row>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-container>
      </template>
    </flo-expand>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import DateUtils from "~/src/dateUtils.js";
export default {
  name: "flo-rfs",
  data: () => ({
    helpers,
    lso: [],
  }),
  props: {
    // v-model prop is always value
    resource: {
      type: String,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      default: "",
      required: false,
    },
    accept: {
      type: String,
      default: ".inp, .out, .csv, .xlsx, .xls, .pdf, .json",
      required: false,
    },
  },
  created() {
    console.log(`flo-rfs: created`);
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async ls() {
      this.lso = [];
      const query = {
        select: {
          id: {},
          fname: {},
          ftype: {},
          fsize: {},
          flm: {},
          resource: {},
          ts: {},
        },
        where: [
          {
            k: "resource",
            op: "equal",
            v: `/${this.resource}/${this.id}`,
          },
          {
            k: "rtype",
            op: "equal",
            v: "attach",
          },
        ],
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/rfs/list`, query);
        this.lso = answer;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return;
    },
    async rm(id) {
      try {
        await this.$axios.$delete(`/api/v1/rfs/${id}`);
        return true;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async cat(id) {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/rfs/${id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async add(rfs) {
      let item = {
        fname: rfs.fname,
        ftype: rfs.ftype,
        fsize: rfs.fsize,
        flm: rfs.flm,
        rtype: "attach",
        field: "",
        resource: `/${this.resource}/${this.id}`,
        content: { data_url: rfs.data_url },
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/rfs`, item);
        if (answer != null) {
          this.lso.push(answer);
          this.tellUser("success", `${answer.resource} Id: ${answer.id} created successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    addResourceFile(event) {
      helpers
        .readFileAsDataURL(event)
        .then((content) => {
          let d = new Date(event.lastModified);
          // console.log(`flo-rfs lastModified as Date: ${d}`);
          let lmts = DateUtils.localToLocalLikeIso(d);
          // console.log(`flo-rfs lastModified as ts: ${lmts}`);

          let answer = {
            fname: event.name,
            ftype: event.type,
            fsize: event.size,
            flm: lmts,
            data_url: content,
          };

          this.add(answer);
        })
        .catch((err) => {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        });
    },
    formatName(name) {
      if (name.length > 20) {
        return `${name.substring(0, 20)}... .${name.split(".")[1]}`;
      }
      return name;
    },
    async deleteResourceFile(file) {
      let answer = await this.rm(file.id);
      if (answer == true) {
        this.lso = this.lso.filter((f) => f.id != file.id);
        this.tellUser("success", `${this.resource} Id:${this.id} Name: ${file.name} deleted successfully`);
        return true;
      }

      return false;
    },
    async downloadResourceFile(file) {
      let answer = await this.cat(file.id);
      if (answer != null) {
        let link = document.createElement("a");
        link.download = answer.fname;
        link.href = answer.content.data_url;

        document.body.appendChild(link);
        link.click();
        link.remove();
        return true;
      }

      return false;
    },
    initialize() {
      this.ls();
    },
    displayIcon(name) {
      let type = name.slice(((name.lastIndexOf(".") - 1) >>> 0) + 2);
      switch (type) {
        case "inp":
          return {
            icon: "mdi-file-import",
            color: "info",
          };
        case "out":
          return {
            icon: "mdi-file-upload",
            color: "primary",
          };
        case "outp":
          return {
            icon: "mdi-file-upload",
            color: "primary",
          };
        case "ota":
          return {
            icon: "mdi-file-phone",
            color: "primary",
          };
        case "csv":
          return {
            icon: "mdi-file-delimited",
            color: "accent",
          };
        case "json":
          return {
            icon: "mdi-code-json",
            color: "warning",
          };
        case "pdf":
          return {
            icon: "mdi-adobe-acrobat",
            color: "error",
          };
        case "xls":
          return {
            icon: "mdi-microsoft-excel",
            color: "success",
          };
        case "xlsx":
          return {
            icon: "mdi-microsoft-excel",
            color: "success",
          };
        case "cap":
          return {
            icon: "mdi-file-code",
            color: "success",
          };
        default:
          return {
            icon: "mdi-file-alert",
            color: "warning",
          };
      }
    },
  },
};
</script>
