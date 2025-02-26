<template>
  <div class="flo-virtual-field-table">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col cols="12" class="ma-0 pa-0">
          <v-card flat outlined>
            <v-card-title>Virtual Fields</v-card-title>
            <v-card-text>
              <template v-if="$vuetify.breakpoint.smAndDown">
                <v-speed-dial fixed bottom right direction="top" transition="slide-y-reverse-transition">
                  <template v-slot:activator>
                    <v-btn color="accent" fab>
                      <v-icon>mdi-orbit</v-icon>
                    </v-btn>
                  </template>

                  <v-btn @click="edit(vf.defaultItem)" :disabled="readonly" fab small color="accent">
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>

                  <v-btn fab small color="accent" @click="importFile()">
                    <v-icon>mdi-file-import</v-icon>
                  </v-btn>
                  <v-btn fab small color="accent" @click="exportFile()"><v-icon>mdi-file-export</v-icon></v-btn>
                </v-speed-dial>
              </template>
              <v-data-table :headers="vf.headers" :items="vf.records" :search="vf.search" :key="vf_version" :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" class="resourcetable elevation-0">
                <template v-slot:top>
                  <v-toolbar flat dense color="rgba(0,0,0,0)">
                    <template v-if="$vuetify.breakpoint.mdAndUp">
                      <v-text-field v-model="vf.search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>

                      <v-divider class="mx-4" inset vertical></v-divider>
                      <div class="flex-grow-1"></div>
                      <template v-if="!readonly">
                        <v-btn color="primary" dark class="mb-2" @click="edit(vf.defaultItem)" :disabled="readonly">
                          <v-icon left>mdi-plus</v-icon>
                          New</v-btn
                        >
                        <v-btn color="primary" dark class="mb-2 mx-2" @click="importFile()">
                          <v-icon left>mdi-file-import</v-icon>
                          Import
                        </v-btn>
                        <v-btn color="primary" dark class="mb-2" @click="exportFile()"><v-icon left>mdi-file-export</v-icon>Export</v-btn>
                      </template>
                    </template>
                    <template v-else>
                      <v-text-field v-model="vf.search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field>
                    </template>

                    <v-dialog :overlay-opacity="0.4" persistent v-model="vf.dialog" scrollable max-width="800px">
                      <v-card>
                        <v-card-title>
                          {{ formVfTitle }}
                        </v-card-title>

                        <v-card-text>
                          <v-container>
                            <v-row>
                              <template v-for="(header, i) in vf.headers">
                                <v-col v-if="header.value != 'action' && header.value != 'id' && header.value != 'vfile_definition_id'" cols="12" lg="6" :key="'vf' + i">
                                  <v-text-field v-if="header.value == 'name'" :rules="[rules.name]" v-model="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-text-field v-else-if="header.value == 'description'" :rules="[rules.description]" v-model="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-text-field v-else-if="header.value == 'path'" :rules="[rules.path]" v-model="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-text-field v-else-if="header.value == 'offset'" :rules="[rules.offset]" v-model.number="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-text-field v-else-if="header.value == 'elements'" :rules="[rules.offset]" v-model.number="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-text-field v-else-if="header.value == 'len'" :rules="[rules.len]" v-model.number="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                  <v-select v-else-if="header.value == 'type'" v-model="vf.editedItem[header.value]" :items="vf_type" :label="header.text" :hint="header.hint" :disabled="readonly" item-text="value" item-value="key" filled persistent-hint></v-select>
                                  <v-text-field v-else v-model="vf.editedItem[header.value]" :label="header.text" :hint="header.hint" :disabled="readonly" persistent-hint></v-text-field>
                                </v-col>
                              </template>
                            </v-row>
                          </v-container>
                        </v-card-text>

                        <v-card-actions>
                          <div class="flex-grow-1"></div>
                          <v-btn color="primary" text @click="close()">Cancel</v-btn>
                          <v-btn color="primary" text @click="save()" :disabled="readonly">Save</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-dialog :overlay-opacity="0.4" persistent v-model="vf.uploadDialog" max-width="600px">
                      <v-card>
                        <v-card-title>
                          <span class="headline">Upload Virtual Fields</span>
                        </v-card-title>
                        <v-card-text>
                          <v-container fluid class="ma-0 pa-0">
                            <v-row no-gutters>
                              <v-col cols="12">
                                <blockquote class="blockquote">
                                  Note: File type is JSON with the following parameters:
                                  <code>"name", "description", "offset", "len", "perm", "type", "pattern", "group"</code>
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
                          <v-btn color="primary" text @click="closeImport()">Cancel</v-btn>
                          <v-btn color="primary" text @click="saveImport()" :disabled="readonly">Upload</v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-toolbar>
                </template>

                <template v-slot:item="row">
                  <template v-if="$vuetify.breakpoint.smAndUp">
                    <tr :style="invalidRows(row.item) ? `background-color: ${$vuetify.theme.currentTheme['error']}19;` : ''">
                      <td v-for="header in row.headers" :key="`vf-${row.index}-${header.value}`" :class="`text-${typeof header.align == undefined ? 'center' : header.align}`">
                        <template v-if="header.value == 'action'">
                          <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                            <div class="flex-grow-1"></div>
                            <template v-if="!readonly">
                              <v-btn class="ma-2" color="primary" @click="edit(row.item)"> <v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                              <v-btn color="primary" @click="setDeleteItem(row.item)" :disabled="readonly">
                                <v-icon>mdi-delete</v-icon>
                              </v-btn>
                            </template>
                          </v-container>
                        </template>
                        <template v-if="header.value == 'type'">
                          <v-chip class="text-capitalize" color="info" label>
                            {{ row.item[header.value] }}
                          </v-chip>
                        </template>
                        <template v-else>
                          <span>{{ row.item[header.value] }}</span>
                        </template>
                      </td>
                    </tr>
                  </template>
                  <template v-else>
                    <v-container class="ma-0 pa-1">
                      <flo-expand elevation="0" :color="$vuetify.theme.dark ? (row.index % 2 == 0 ? '#FFFFFF0D' : '#00000000') : row.index % 2 == 0 ? '#0000000D' : '#00000000'">
                        <template v-slot:title>
                          <v-chip label class="ma-2">{{ row.item.name.replace(/_/g, " ") }}</v-chip>
                        </template>

                        <template v-slot:content>
                          <v-list color="#00000000" class="ma-0 pa-0">
                            <template v-for="header in row.headers">
                              <template v-if="header.value == 'action'">
                                <v-list-item :key="`vf-${row.index}-${header.value}`">
                                  <v-list-item-content class="ma-0 pa-0">
                                    <v-list-item-title>{{ header.text }}</v-list-item-title>
                                  </v-list-item-content>
                                  <v-list-item-action>
                                    <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                      <v-btn fab small color="primary" @click="edit(row.item)" :disabled="readonly">
                                        <v-icon>mdi-pencil</v-icon>
                                      </v-btn>
                                      <v-btn fab small color="primary" class="ml-1" @click="setDeleteItem(row.item)" :disabled="readonly">
                                        <v-icon>mdi-delete</v-icon>
                                      </v-btn>
                                      <div class="flex-grow-1"></div>
                                    </v-container>
                                  </v-list-item-action>
                                </v-list-item>
                              </template>

                              <template v-else>
                                <v-list-item :key="`vf-${row.index}-${header.value}`">
                                  <v-list-item-content class="ma-0 pa-0">
                                    <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                  </v-list-item-content>
                                  <v-list-item-action>
                                    <template>
                                      <span>{{ row.item[header.value] }}</span>
                                    </template>
                                  </v-list-item-action>
                                </v-list-item>
                                <v-divider :key="`d${row.index}-${header.value}`" class="mx-4"></v-divider>
                              </template>
                            </template>
                          </v-list>
                        </template>
                      </flo-expand>
                    </v-container>
                  </template>
                </template>

                <template v-slot:no-data>No Data</template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
      <v-dialog :overlay-opacity="0.4" persistent v-model="vf.deleteDialog" width="auto ">
        <v-card>
          <v-card-title>Are you sure you want to delete this virtual field?</v-card-title>
          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="vf.deleteDialog = false">Cancel</v-btn>
            <v-btn color="primary" text @click="deleteItem()">Delete</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-virtual-field-table",
  data() {
    return {
      helpers,
      vf_version: 1,
      vf_type: [
        { key: "string", value: "String" },
        { key: "boolean", value: "Boolean" },
        { key: "number", value: "Number" },
      ],
      vf: {
        search: "",
        headers: [],
        records: [],
        editedItem: {},
        importFile: {},
        itemForDeletion: {},
        editedIndex: -1,
        loading: true,
        dialog: false,
        uploadDialog: false,
        deleteDialog: false,
      },
      rules: {
        name: (value) => {
          const pattern = /^.{2,}$/;
          return pattern.test(value) || "Invalid name format.";
        },
        description: (value) => {
          const pattern = /^.{2,}$/;
          return pattern.test(value) || "Invalid description format.";
        },
        url: (value) => {
          const pattern = /^(?:[a-fA-F0-9]{4}\/?)*$/gm;
          return pattern.test(value) || "Invalid URL format.";
        },
        path: (value) => {
          const pattern = /^(?:[a-fA-F0-9]{4}\/?)*$/gm;
          return pattern.test(value) || "Invalid URL format.";
        },
        recno: (value) => {
          const pattern = /^[0-9]*$/;
          return pattern.test(value) || "Invalid number format.";
        },
        offset: (value) => {
          const pattern = /^[0-9]*$/;
          return pattern.test(value) || "Invalid number format.";
        },
        len: (value) => {
          const pattern = /^[0-9]*$/;
          return pattern.test(value) || "Invalid number format.";
        },
        recsize: (value) => {
          const pattern = /^([01]?[0-9]?[0-9]|2[0-4][0-9]|25[0-5])$/;
          return pattern.test(value) || "Invalid size format.";
        },
      },
    };
  },
  props: {
    value: {
      required: true,
      default: null,
    },
    resource: {
      type: [Object, Array],
      required: true,
      default: null,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    readonlystructure: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    formVfTitle() {
      return this.vf.editedIndex === -1 ? "New " + "Virtual Field" : "Edit " + "Virtual Field";
    },
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      this.load();
    },
    importFile() {
      this.vf.uploadDialog = true;
    },
    exportFile() {
      console.log(`flo-virtual-field-table - exportFile: ${JSON.stringify(this.vf.records)}`);
      if (this.vf.records.length > 0) {
        let download = `${this.resource.name.toLowerCase().replace(/ /g, "_")}_virtual_fields.json`;
        let blob = new Blob([JSON.stringify(this.vf.records, null, 2)], { type: "text/json" });
        let url = URL.createObjectURL(blob);
        let link = document.createElement("a");
        link.href = url;
        link.download = download;
        link.click();
        link.remove();
      }
    },
    importChanged(event) {
      helpers
        .readFileAsText(event)
        .then((content) => {
          this.vf.importFile = JSON.parse(content);
        })
        .catch((err) => {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        });
    },
    closeImport() {
      this.vf.uploadDialog = false;
    },
    async saveImport() {
      let res = this.resource;

      if (Object.keys(this.vf.importFile).length > 0) {
        let vfile = this.vf.importFile;

        res["fields"] = vfile;
        this.vf.records = res.fields;
      }
      await this.update(res);
      this.closeImport();
    },
    setDeleteItem(item) {
      this.vf.itemForDeletion = item;
      this.vf.deleteDialog = true;
    },
    async deleteItem() {
      let res = this.resource;
      let records = this.vf.records;
      let index = records.indexOf(this.vf.itemForDeletion);
      records.splice(index, 1);

      if (res.hasOwnProperty("fields")) {
        delete res.fields;
      }
      res["fields"] = { fields: records };

      await this.update(res);
      this.vf.deleteDialog = false;
    },
    load() {
      let lheaders = [
        { text: "Name", value: "name", hint: "Item Name" },
        { text: "Description", value: "description", hint: "Item Description" },
        { text: "Offset", value: "offset", hint: "Offset" },
        { text: "Length", value: "len", hint: "Length" },
        { text: "Group Path", value: "gpath", hint: "Group Path" },
        { text: "Permissions", value: "perm", hint: "Item Permissions" },
        { text: "Key", value: "key", hint: "Item Key" },
        { text: "Type", value: "type", hint: "Data Type" },
        { text: "Pattern", value: "pattern", hint: "Validation Pattern" },
      ];
      if (!this.readonly) {
        lheaders.push({ text: "Actions", value: "action", align: "center" });
      }
      let leditedItem = { name: "", description: "", offset: 0, len: 0, gpath: "", ui: "", elements: "", perm: "", type: "", pattern: "", key: "" };
      if (null != this.value) {
        if (this.value.length > 0) {
          let lfields = this.value;
          this.vf.records = lfields;
        }
      }

      this.vf.headers = lheaders;
      this.vf.editedItem = leditedItem;
      this.vf.loading = false;
    },
    close() {
      this.vf.dialog = false;
      setTimeout(() => {
        this.vf.editedItem = Object.assign({}, this.vf.defaultItem);
        this.vf.editedIndex = -1;
      }, 300);
    },
    async save() {
      let res = this.resource;
      let records = this.vf.records;

      if (this.vf.editedIndex == -1) {
        records.push(this.vf.editedItem);
        if (res.hasOwnProperty("fields")) {
          delete res.fields;
        }
        res["fields"] = records;
        await this.update(res);
      } else {
        records[this.vf.editedIndex] = this.vf.editedItem;
        if (res.hasOwnProperty("fields")) {
          delete res.fields;
        }
        res["fields"] = records;
        await this.update(res);
      }
      this.close();
    },
    edit(item) {
      this.vf.editedIndex = this.vf.records.indexOf(item);
      if (-1 != this.vf.editedIndex) {
        this.vf.editedItem = Object.assign({}, item);
      }
      this.vf.dialog = true;
    },
    async update(res) {
      try {
        let answer = await this.$axios.$put(`/api/v1/vfile_definitions/${res.id}`, res);
        if (answer != null) {
          this.tellUser("success", `${answer.resource}, File Id: ${answer.id} updated successfully.`);
        }
        this.vf_version++;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    invalidRows(item) {
      let recs = this.vf.records;
      let current = recs.find((f) => item.key == f.key);
      let sorted = recs.filter((f) => f.offset > current.offset);
      sorted.sort((a, b) => a.offset - b.offset);

      if (sorted.length > 0) {
        let next = sorted[0];
        let elements = current.hasOwnProperty("elements") ? current.elements : 1;

        if (current.offset + current.len * elements != next.offset) {
          return true;
        }
      }

      return false;
    },
  },
};
</script>
