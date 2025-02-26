<template>
  <div class="flo-rfs-field">
    <v-card outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-1 pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <template v-if="dvalue == 0">
                <v-file-input :error="upload_error" :error-messages="upload_error_message" :accept="accept" :label="label" :hint="hint" :clearable="false" @change="input_file_changed($event)" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50" persistent-hint show-size counter :disabled="disabled"></v-file-input>
              </template>
              <template v-else>
                <v-list class="ma-0 pa-0">
                  <v-list-item class="ma-0 pa-0">
                    <v-list-item-avatar class="ma-0 pa-0">
                      <v-icon :color="displayIcon(selected.fname).color">
                        {{ displayIcon(selected.fname).icon }}
                      </v-icon>
                    </v-list-item-avatar>

                    <v-list-item-content class="ma-0 pa-0">
                      <v-list-item-title>{{ formatName(selected.fname) }}</v-list-item-title>
                      <v-list-item-subtitle>{{ helpers.toLocalTimeInIsoFormatUi(selected.ts) }}</v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action class="ma-0 pa-0">
                      <v-row no-gutters>
                        <v-btn icon @click="downloadResourceFile(selected)">
                          <v-icon color="success">mdi-download</v-icon>
                        </v-btn>
                        <v-btn icon @click="deleteDialog()" :disabled="disabled">
                          <v-icon color="error">mdi-delete</v-icon>
                        </v-btn>
                      </v-row>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </template>
            </v-col>
          </v-row>

          <v-row v-if="selected" no-gutters>
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
              <v-dialog :overlay-opacity="0.4" v-model="delete_dialog" persistent width="auto ">
                <v-card flat>
                  <v-card-title>
                    <v-row no-gutters justify="center">
                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
                        <v-icon x-large color="warning">mdi-alert</v-icon>
                      </v-col>
                    </v-row>
                  </v-card-title>
                  <v-card-text>
                    <v-container fluid class="ma-0 pa-0">
                      <v-row no-gutters justify="center">
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"
                          ><span class="title text--primary">Are you sure you want to delete {{ formatName(selected.fname) }}?</span>
                        </v-col>
                      </v-row>
                      <v-row no-gutters justify="center">
                        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">This action is irreversible and will result in loss of all data.</span> </v-col>
                      </v-row>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="deleteDialog()">Cancel</v-btn>
                    <v-btn color="primary" text @click="deleteResourceFile(selected)">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import DateUtils from "~/src/dateUtils.js";
export default {
  name: "flo-rfs-field",
  data: () => ({
    helpers,
    delete_dialog: false,
    upload_error: false,
    upload_error_message: "",
    dvalue: 0,
    selected: null,
  }),
  props: {
    id: {
      type: Number,
      required: true,
    },
    resource: {
      type: String,
      required: true,
    },
    field: {
      type: String,
      default: "",
      required: true,
    },
    label: {
      type: String,
      default: "",
      required: false,
    },
    hint: {
      type: String,
      default: "",
      required: false,
    },
    accept: {
      type: String,
      default: ".inp, .out, .csv, .xlsx, .xls, .pdf, .json",
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async ls_field(field) {
      let request = {
        field: field,
        id: this.id,
      };

      try {
        let answer = await this.$axios.$post(`/api/v1/${this.resource}/rfs/list`, request);
        if (answer.length > 0) {
          return answer[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }

      return null;
    },
    async cat(id) {
      let answer = null;
      try {
        answer = await this.$axios.$get(`/api/v1/${this.resource}/rfs/${id}`);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      return answer;
    },
    async rm(id) {
      try {
        await this.$axios.$delete(`/api/v1/${this.resource}/rfs/${id}`);
        this.upload_error = false;
        this.upload_error_message = "";
        return true;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async add(rfs) {
      let item = {
        fname: rfs.fname,
        ftype: rfs.ftype,
        fsize: rfs.fsize,
        flm: rfs.flm,
        rtype: "field",
        field: this.field,
        resource: this.resource,
        rid: this.id,
        content: { data_url: rfs.data_url },
      };

      let answer = null;

      try {
        answer = await this.$axios.$post(`/api/v1/${this.resource}/rfs`, item);
        if (answer != null) {
          this.dvalue = answer.id;
          this.selected = answer;
          this.$emit("input", this.dvalue);
          this.tellUser("success", `Id: ${answer.id} - ${answer.fname} created successfully.`);
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
        throw lerr;
      }

      return answer;
    },
    async input_file_changed(event) {
      if (!event) {
        return;
      }
      if (!event.type) {
        this.upload_error = true;
        this.upload_error_message = "File has no type.";
        return;
      }

      let l_type = event.type;
      if (this.accept == ".json") {
        if (l_type == "application/json") {
          try {
            let answer = await this.addResourceFile(event);
            this.$emit("change", answer);
          } catch (err) {
            this.upload_error = true;
            this.upload_error_message = `${err.statusCode} - ${err.message}`;
          }
        }
      }
      if (this.accept == ".cap") {
        if (l_type == "image/CAP") {
          try {
            let answer = await this.addResourceFile(event);
            this.$emit("change", answer);
          } catch (err) {
            this.upload_error = true;
            this.upload_error_message = `${err.statusCode} - ${err.message}`;
          }
        }
      }
    },
    async addResourceFile(event) {
      let answer = null;
      try {
        let lcontent = await helpers.readFileAsDataURL(event);
        let d = new Date(event.lastModified);
        let lmts = DateUtils.localToLocalLikeIso(d);

        answer = {
          fname: event.name,
          ftype: event.type,
          fsize: event.size,
          flm: lmts,
          data_url: lcontent,
        };

        await this.add(answer);
      } catch (err) {
        this.tellUser("error", err);
        throw err;
      }

      return answer;
    },
    async deleteResourceFile(file) {
      let answer = await this.rm(file.id);
      if (answer == true) {
        this.dvalue = 0;
        this.selected = null;
        this.$emit("change", null);
        this.tellUser("success", `Id: ${file.id} - ${file.fname} deleted successfully.`);
        this.deleteDialog();
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
    async initialize() {
      this.dvalue = 0;
      let _selected = await this.ls_field(this.field);
      if (_selected) {
        this.selected = _selected;
        if (this.selected) {
          this.dvalue = this.selected.id;
          if (this.dvalue != this.value) {
            this.$emit("input", this.dvalue);
          }
        }
      }
    },
    deleteDialog() {
      this.delete_dialog = !this.delete_dialog;
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
    formatName(name) {
      if (this.$vuetify.breakpoint.xs) {
        return `${name.substring(0, 20)}... .${name.split(".")[1]}`;
      }
      return name;
    },
  },
};
</script>
