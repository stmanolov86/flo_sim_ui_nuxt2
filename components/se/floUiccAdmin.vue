<template>
  <div class="flo-uicc-admin">
    <v-row>
      <v-col cols="12" xl="6" lg="6">
        <v-file-input class="mt-1" accept=".inp, .out, .csv, .xlsx, .xls, .pdf" label="Upload Profile" :clearable="false" @change="addResourceFile($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" show-size counter></v-file-input>
      </v-col>
      <v-col cols="12" xl="6" lg="6">
        <flo-expand title="Profiles" elevation="0">
          <template v-slot:content="{}">
            <v-list>
              <v-list-item v-for="(file, idx) in lso" :key="idx">
                <v-list-item-avatar>
                  <v-icon :color="displayIcon(file.name).color">
                    {{ displayIcon(file.name).icon }}
                  </v-icon>
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>{{ formatName(file.name) }}</v-list-item-title>
                  <v-list-item-subtitle>{{ formatTs(file.ts) }}</v-list-item-subtitle>
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
          </template>
        </flo-expand>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-uicc-admin",
  data: () => ({
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
  },
  created() {
    console.log(`flo-uicc-admin: created`);
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async ls() {
      this.lso = [];
      // Don't get the file content if it's too big
      const llist = {
        query: {
          select: {
            id: {},
            name: {},
            resource: {},
            ts: {},
          },
          where: [
            {
              k: "resource",
              op: "equal",
              v: `/${this.resource}/${this.id}`,
            },
          ],
        },
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/rfs/list`, llist);
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
    async add(name, content) {
      let item = {
        name: name,
        resource: `/${this.resource}/${this.id}`,
        content: { data_url: content },
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
          this.add(event.name, content);
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
    formatTs(ts) {
      return helpers.toLocalTimeInIsoFormatUi(ts);
    },
    displayIcon(name) {
      let type = name.split(".")[1];
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
        case "csv":
          return {
            icon: "mdi-file",
            color: "accent",
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
        default:
          return {
            icon: "mdi-file-alert",
            color: "warning",
          };
      }
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
        // TODO: save to disk ...
        // hmmm .. we need a v-input-file so we can say where to save it ... never done it
        let link = document.createElement("a");

        // downloadLink.href = linkSource;
        // downloadLink.download = fileName;

        // link.setAttribute("download", answer.name);
        link.download = answer.name;
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
  },
};
</script>
