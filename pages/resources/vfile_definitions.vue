<template>
  <div>
    <v-row no-gutters>
      <v-col cols="12" class="pa-1">
        <v-dialog :overlay-opacity="0.4" persistent v-model="uploadDialog" max-width="600px">
          <v-card>
            <v-card-title>
              <span class="headline">Upload Virtual Files</span>
            </v-card-title>

            <v-card-text>
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12">
                    <blockquote class="blockquote">
                      Note: File type is JSON with the following parameters:
                      <code>"name", "description", "offset", "len", "type", "path", "fields"</code>
                    </blockquote>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-file-input accept=".json" label="Select File" :clearable="false" @change="importChanged($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" hide-details outlined dense></v-file-input>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>

            <v-card-actions>
              <div class="flex-grow-1"></div>
              <v-btn color="primary" text @click="close()">Cancel</v-btn>
              <v-btn color="primary" text @click="upload()">Upload</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <flo-meta-table v-if="translator !== null" @load-data="onLoadData($event)" :resources="resources" @pre-new="onPreNew($event)" @pre-edit="onPreEdit($event)" :show_title="false" :translator="translator" :hidden_filter="hidden_filter" :key="vf_version" dialogWidth="1400px">
      <template v-slot:ex_new="{ fab, color, permissions, smAndDown }">
        <template v-if="permissions.c == true">
          <v-btn :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="importDialog()">
            <v-icon :left="!smAndDown">mdi-file-import</v-icon>
            {{ !smAndDown ? "Import" : "" }}
          </v-btn>
          <v-btn :fab="fab" :small="smAndDown" class="mx-1" :color="color" @click="exportFile()"
            ><v-icon :left="!smAndDown">mdi-file-export</v-icon>
            {{ !smAndDown ? "Export" : "" }}
          </v-btn>
        </template>
      </template>

      <template v-slot:view_type="{ fmtrow }">
        <v-chip v-if="fmtrow.type" label :color="getType(fmtrow.type).color">{{ getType(fmtrow.type).type }}</v-chip>
      </template>
      <template v-slot:edit_fields="{ fmtheader, fmtrow }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" class="pa-1">
          <flo-virtual-field-table :resource="fmtrow" :value="fmtrow.fields" />
        </v-col>
      </template>
    </flo-meta-table>
  </div>
</template>

<script>
import floVirtualFieldTable from "~/components/virtual/floVirtualFieldTable.vue";
import floMetaTable from "~/components/crud/floMetaTable.vue";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  data: () => ({
    helpers,
    resources: "vfile_definitions",
    translator: null,
    hidden_filter: [],
    vf_data: [],
    uploadDialog: false,
    importFile: {},
    vf_version: 1,
  }),
  components: {
    floVirtualFieldTable,
    floMetaTable,
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    onLoadData(data) {
      this.vf_data = data.items;

      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "rid":
          case "resource":
            {
              header.view = false;
              header.edit = false;
              header.disable_new = true;
            }
            break;
          case "fields":
            {
              header.view = false;
              header.disable_new = true;
            }
            break;
          case "ui":
          case "gpath":
            {
              header.view = false;
            }
            break;
        }
      }
    },
    initialize() {
      this.hidden_filter = [
        {
          k: "resource",
          op: "equal",
          v: "system",
        },
      ];
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      this.translator = translator;
    },
    getType(type) {
      let ltype = {
        color: "",
        type: "",
      };
      let l_type = "";
      if (type) {
        l_type = type.toLowerCase();
      }
      if (l_type == "binary") {
        ltype.color = "primary";
        ltype.type = "Binary";
      } else if (l_type == "record") {
        ltype.color = "info";
        ltype.type = "Record";
      }

      return ltype;
    },
    onPreEdit(data) {
      data.record.resource = "system";
    },
    onPreNew(data) {
      data.record.resource = "system";
    },
    importDialog() {
      this.uploadDialog = true;
    },
    importChanged(event) {
      helpers
        .readFileAsText(event)
        .then((content) => {
          this.importFile = JSON.parse(content);
        })
        .catch((err) => {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        });
    },
    close() {
      this.uploadDialog = false;
    },
    async upload() {
      if (this.importFile.length > 0) {
        for (const vfile of this.importFile) {
          if (vfile.hasOwnProperty("id")) {
            delete vfile.id;
          }

          vfile["rid"] = 1;
          vfile["resource"] = "system";

          try {
            let answer = await this.$axios.$post("/api/v1/vfile_definitions", vfile);
            if (answer != null) {
              this.tellUser("success", `File ID: ${answer.id}, File Name: ${answer.name} uploaded successfully.`);
            }
            this.close();
          } catch (err) {
            let lerr = this.parseNetError(err);
            this.tellUser("error", lerr);
          }
        }
        this.vf_version++;
      }
    },
    exportFile() {
      console.log(`flo-applet - exportFile - ${JSON.stringify(this.vf_data)}`);
      if (this.vf_data.length > 0) {
        let blob = new Blob([JSON.stringify(this.vf_data, null, 2)], { type: "text/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = "VirtualFiles.json";
        link.click();
        link.remove();
      }
    },
  },
};
</script>
