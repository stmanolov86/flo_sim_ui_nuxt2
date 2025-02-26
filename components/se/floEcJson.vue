<template>
  <div class="flo-ec-json">
    <v-container fluid class="ma-1 pa-1">
      <v-row no-gutters>
        <v-col cols="12" class="ma-1 pa-1">
          <v-tabs v-model="selected_tab">
            <v-tab key="ec-1" v-if="ec != null">UI</v-tab>
            <v-tab key="ec-2" v-if="ec != null">JSON</v-tab>
          </v-tabs>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <v-tabs-items v-model="selected_tab">
            <v-tab-item key="ec-1">
              <v-container fluid v-if="ec" class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col>
                    <v-data-table :headers="headers" :items="ec.data" :search="search" :key="version" class="resourcetable elevation-0" calculate-widths dense :mobile-breakpoint="960">
                      <template v-slot:top>
                        <v-toolbar flat color="rgba(0,0,0,0)">
                          <v-toolbar-title>Electrical Profile</v-toolbar-title>
                          <v-divider class="mx-4" inset vertical></v-divider>
                          <v-text-field v-model="search" append-icon="mdi-magnify" label="Search" clearable hide-details></v-text-field>
                          <v-divider class="mx-4" inset vertical></v-divider>
                          <div class="flex-grow-1"></div>
                          <v-divider class="mx-4" inset vertical></v-divider>
                          <v-btn v-if="allow_create()" color="primary" @click="editDialog = true">
                            <v-icon left>mdi-plus</v-icon>
                            New
                          </v-btn>
                          <v-btn
                            v-if="allow_redirect"
                            class="mx-1"
                            color="primary"
                            router
                            :to="{
                              path: '/resources/uicc/',
                              query: { id: uicc.id },
                            }"
                          >
                            <v-icon left>mdi-chip</v-icon>
                            UICC
                          </v-btn>
                        </v-toolbar>
                      </template>

                      <template v-slot:item="row">
                        <template v-if="$vuetify.breakpoint.mdAndUp">
                          <tr>
                            <td v-for="header in row.headers" :key="`rec-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                              <template v-if="header.value == 'action'">
                                <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                  <div class="flex-grow-1"></div>
                                  <v-btn v-if="allow_edit() && allow_vf(row.item)" color="primary" @click="setItem(row.item)"><v-icon left>mdi-focus-field</v-icon>Set VF</v-btn>
                                  <v-btn v-if="allow_edit()" class="ma-2" color="primary" @click="editItem(row.item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                                  <v-btn v-else class="ma-2" color="primary" @click="editItem(row.item)"><v-icon left>mdi-more</v-icon>View</v-btn>
                                  <v-btn v-if="allow_delete()" color="primary" @click="setDeleteItem(row.item)">
                                    <v-icon center>mdi-delete</v-icon>
                                  </v-btn>
                                </v-container>
                              </template>

                              <template v-else-if="header.value == 'content'">
                                <v-row v-if="row.item[header.value]">
                                  <template v-for="(item, i) in row.item[header.value]">
                                    <template v-if="i < 1">
                                      <v-chip v-if="row.item.type == 'LF' || row.item.type == 'CYC'" label class="ma-1" color="info" :key="i">ID: {{ item.id }}</v-chip>
                                      <v-chip label class="ma-1" :key="`${i}-a`">{{ formatData(item.data) }}</v-chip>
                                    </template>
                                  </template>
                                  <v-chip v-if="row.item[header.value].length > 1" label class="ma-1">...</v-chip>
                                </v-row>
                              </template>

                              <template v-else-if="header.value == 'name'">
                                <v-chip label class="ma-1" :color="row.item[header.value] == 'MF' ? 'success' : 'info'">{{ row.item[header.value] }}</v-chip>
                              </template>
                              <template v-else-if="header.value == 'type'">
                                <v-chip label class="ma-1" :color="row.item[header.value] == 'MF' ? 'success' : 'info'">
                                  <v-icon left>{{ getTypeIcon(row.item[header.value]) }}</v-icon
                                  >{{ row.item[header.value] }}</v-chip
                                >
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
                                <v-chip label class="ma-2">{{ row.item.url }}</v-chip>
                              </template>

                              <template v-slot:content>
                                <v-list color="#00000000" class="ma-0 pa-0">
                                  <template v-for="header in row.headers">
                                    <template v-if="header.value == 'data-table-expand'"></template>
                                    <template v-else-if="header.value == 'action'">
                                      <v-list-item :key="`rset-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-title>{{ header.text }}</v-list-item-title>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                                            <v-btn v-if="allow_edit() && allow_vf(row.item)" color="primary" fab small @click="setItem(row.item)"><v-icon>mdi-focus-field</v-icon></v-btn>
                                            <v-btn v-if="allow_edit()" fab small color="primary" @click="editItem(row.item)"><v-icon>mdi-pencil</v-icon></v-btn>
                                            <v-btn v-else fab small color="primary" @click="editItem(row.item)"><v-icon>mdi-more</v-icon></v-btn>
                                            <v-btn v-if="allow_delete()" fab small color="primary" @click="setDeleteItem(row.item)">
                                              <v-icon center>mdi-delete</v-icon>
                                            </v-btn>
                                            <div class="flex-grow-1"></div>
                                          </v-container>
                                        </v-list-item-action>
                                      </v-list-item>
                                    </template>

                                    <template v-else>
                                      <v-list-item :key="`rset-${row.index}-${header.value}`">
                                        <v-list-item-content class="ma-0 pa-0">
                                          <v-list-item-subtitle>{{ header.text }}</v-list-item-subtitle>
                                        </v-list-item-content>
                                        <v-list-item-action>
                                          <span>{{ row.item[header.value] }}</span>
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
                  </v-col>
                </v-row>
              </v-container>

              <v-dialog :overlay-opacity="0.4" v-model="editDialog" scrollable max-width="800px">
                <v-card>
                  <v-card-title>
                    <span class="headline">Edit Profile</span>
                  </v-card-title>

                  <v-card-text>
                    <v-container>
                      <v-row v-if="editedItem">
                        <template v-for="(header, i) in headers">
                          <v-col v-if="header.value != 'action' && header.value != 'access' && header.value != 'ota' && header.value != 'content' && header.value != 'type' && header.value != 'size'" cols="6" :key="`a-${i}`">
                            <v-text-field :disabled="!allow_edit_structure()" v-model="editedItem[header.value]" :label="header.text" @input="calculateSize()"></v-text-field>
                          </v-col>

                          <v-col :key="`aa-${i}`" cols="6" v-if="header.value == 'type'">
                            <v-select :disabled="!allow_edit_structure()" v-model="editedItem[header.value]" :label="header.text" required item-text="key" item-value="value" :items="type" filled></v-select>
                          </v-col>
                          <v-col :key="`ab-${i}`" cols="6" v-if="header.value == 'size'">
                            <v-text-field disabled v-model="editedItem[header.value]" :label="header.text"></v-text-field>
                          </v-col>
                        </template>

                        <v-card class="my-1 py-1" flat outlined v-if="editedItem.access && Object.keys(editedItem.access).length > 0">
                          <v-card-title> Access </v-card-title>
                          <v-card-text>
                            <v-row>
                              <template v-for="(a, k, i) in editedItem.access">
                                <v-col :key="`b-${i}`" cols="6">
                                  <v-select :disabled="!allow_edit_structure()" v-model="editedItem.access[k]" :label="helpers.capitalizeFLetter(k)" required item-text="value" item-value="key" :items="access" filled></v-select>
                                </v-col>
                              </template>
                            </v-row>
                          </v-card-text>
                        </v-card>

                        <v-card class="my-1 py-1" flat outlined v-if="editedItem.ota && Object.keys(editedItem.ota).length > 0">
                          <v-card-title> OTA </v-card-title>
                          <v-card-text>
                            <v-row>
                              <template v-for="(o, k, i) in editedItem.ota">
                                <v-col :key="`c-${i}`" cols="12" lg="3" xl="3">
                                  <v-switch :disabled="!allow_edit_structure()" true-value="Yes" false-value="No" color="success" inset v-model="editedItem.ota[k]" :label="helpers.capitalizeFLetter(k)"></v-switch>
                                </v-col>
                              </template>
                            </v-row>
                          </v-card-text>
                        </v-card>

                        <v-card class="my-1 py-1" min-width="743" flat outlined v-if="editedItem.content && editedItem.content.length > 0">
                          <v-card-title> Content </v-card-title>
                          <v-card-text>
                            <v-row>
                              <template v-for="(content, i) in editedItem.content">
                                <v-col :key="`d-${i}`" cols="12">
                                  <v-card flat outlined>
                                    <v-card-text>
                                      <template v-for="(c, kk, idx) in content">
                                        <v-text-field :disabled="!allow_edit() || kk == 'id'" v-model="content[kk]" :label="helpers.capitalizeFLetter(kk)" :key="`f-${idx}`"></v-text-field>
                                      </template>
                                    </v-card-text>
                                  </v-card>
                                </v-col>
                              </template>
                            </v-row>
                          </v-card-text>
                        </v-card>
                      </v-row>
                    </v-container>
                  </v-card-text>

                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="closeDialog()">Cancel</v-btn>
                    <v-btn v-if="allow_edit()" color="primary" text @click="syncItem()">Save</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
              <v-dialog :overlay-opacity="0.4" v-model="deleteDialog" width="auto ">
                <v-card>
                  <v-card-title>Are you sure you want to delete this profile?</v-card-title>
                  <v-card-actions>
                    <div class="flex-grow-1"></div>
                    <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
                    <v-btn color="primary" text @click="deleteItem()">Delete</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-tab-item>

            <v-tab-item key="ec-2">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" lg="2" xl="2">
                    <v-radio-group mandatory dense row v-model="mode">
                      <v-radio label="List" value="list" color="success"></v-radio>
                      <v-radio label="Tree" value="tree" color="success"></v-radio>
                    </v-radio-group>
                  </v-col>
                </v-row>
                <v-row no-gutters>
                  <v-col cols="12">
                    <flo-json-editor name="Electrical Profile" mode="view" :modes="['view', 'preview', 'text']" height="600px" :value="getEc(mode)"></flo-json-editor>
                  </v-col>
                </v-row>
              </v-container>
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-ec-json",
  data() {
    return {
      helpers,
      mode: "",
      selected_tab: 0,
      ec: null,
      version: 1,
      search: "",
      headers: [],
      editedItem: {},
      editedIndex: -1,
      editDialog: false,
      deleteDialog: false,
      itemForDeletion: {},
      access: [
        { key: "2F06", value: "2F06" },
        { key: "6F06", value: "6F06" },
        { key: "ADM", value: "ADM" },
        { key: "ADM1", value: "ADM1" },
        { key: "Alw", value: "ALW" },
        { key: "Nev", value: "NEV" },
        { key: "PIN1", value: "PIN1" },
        { key: "SPIN1", value: "SPIN1" },
        { key: "PIN Appl 1", value: "PIN Appl 1" },
        { key: "PIN Appl 2", value: "PIN Appl 2" },
        { key: "PIN Appl 3", value: "PIN Appl 3" },
        { key: "PIN Appl 4", value: "PIN Appl 4" },
        { key: "PIN Appl 5", value: "PIN Appl 5" },
        { key: "PIN Appl 6", value: "PIN Appl 6" },
        { key: "PIN Appl 7", value: "PIN Appl 7" },
        { key: "PIN Appl 8", value: "PIN Appl 8" },
        { key: "PIN Appl 9", value: "PIN Appl 9" },
        { key: "PIN Appl 10", value: "PIN Appl 10" },
      ],
      type: [
        { key: "TR", value: "TR" },
        { key: "DF", value: "DF" },
        { key: "LF", value: "LF" },
        { key: "MF", value: "MF" },
        { key: "LNK", value: "LNK" },
        { key: "CYC", value: "CYC" },
      ],
    };
  },
  props: {
    uicc: {
      type: [Object, Array],
      required: false,
      default: null,
    },
    value: {
      type: Object,
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
    allow_redirect: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  watch: {
    editDialog(val) {
      val || this.closeDialog();
    },
  },
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    allow_create() {
      if (this.readonly) {
        return false;
      }

      if (this.readonlystructure) {
        return false;
      }
      return true;
    },
    allow_delete() {
      if (this.readonly) {
        return false;
      }

      if (this.readonlystructure) {
        return false;
      }
      return true;
    },
    allow_edit() {
      if (this.readonly) {
        return false;
      }
      return true;
    },
    allow_vf(item) {
      if (item.type == "TR" || item.type == "LF" || item.type == "CYC" || item.type == "LNK") {
        return true;
      }
      return false;
    },
    allow_edit_structure() {
      if (this.readonly) {
        return false;
      }

      if (this.readonlystructure) {
        return false;
      }

      return true;
    },
    getEc(mode) {
      if (mode == "list") {
        return this.ec;
      } else if (mode == "tree") {
        return {
          type: "ec",
          data: this.getEcDataTree(this.ec.data),
        };
      }
    },
    getEcDataTree(items) {
      // create root
      let root = {};
      // clone
      let citems = JSON.parse(JSON.stringify(items));

      for (let ief = 0; ief < citems.length; ief++) {
        // get next header
        const f = citems[ief];
        // point iterator to root
        let it = root;
        let last_child = null;
        let last_branch = "";

        let gurl = f.url;
        // console.log(`crud table: getEcDataTree - gpath - ${JSON.stringify(gpath)}`);
        let gurl_arr = gurl.split("/");
        // console.log(`crud table: getEcDataTree - gpath_arr - ${JSON.stringify(gpath_arr)}`);

        // traverse over the branches
        const lbranches = gurl_arr.length;
        if (lbranches == 1) {
          it[gurl] = f;
        } else {
          for (let igbk = 0; igbk < lbranches; igbk++) {
            // get branch key
            const lgbk = gurl_arr[igbk];
            last_branch = lgbk;

            // get children
            let directory = null;

            if (it.hasOwnProperty(lgbk)) {
              it = it[lgbk];
              continue;
            }

            // create children if needed
            if (!it.hasOwnProperty("directory")) {
              // console.log(`crud table: getEcDataTree - lgbk - ${lgbk} has no children .. create`);
              it["directory"] = {};
            }

            directory = it["directory"];

            // console.log(`crud table: getEcDataTree - lgbk - ${lgbk}`);
            if (!directory.hasOwnProperty(lgbk)) {
              // console.log(`crud table: getEcDataTree - lgbk - ${lgbk} - continue`);
              directory[lgbk] = {};
            }

            last_child = directory;
            it = directory[lgbk];
          }
          last_child[last_branch] = f;
        }
      }
      return root;
    },
    editItem(item) {
      this.editedIndex = this.ec.data.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },
    async setItem(item) {
      let ltype = item.type.toLowerCase();
      let v_field = {};

      if (ltype != "lnk") {
        v_field = {
          url: item.url,
          name: item.name,
          len: item.recsize,
          description: item.name,
          type: ltype == "tr" ? "binary" : ltype == "lf" || ltype == "cyc" ? "record" : "",
        };
      } else {
        if (item.hasOwnProperty("content")) {
          let l_content = item.content;
          if (l_content.length > 0) {
            if (l_content[0].hasOwnProperty("data")) {
              let l_data = l_content[0].data.toLowerCase();
              if (l_data.includes("linked to:")) {
                let l_link_to = l_data.replace("linked to:", "").trim();
                let found = this.ec.data.find((ef) => ef.url.toLowerCase().trim() == l_link_to);
                if (found) {
                  let ftype = found.type.toLowerCase();
                  v_field = {
                    url: item.url,
                    name: found.name,
                    len: found.recsize,
                    description: found.name,
                    type: ftype == "tr" ? "binary" : ftype == "lf" || ftype == "cyc" ? "record" : "",
                  };
                }
              }
            }
          }
        }
      }

      if (v_field.type != "binary") {
        v_field["offset"] = 1;
      }

      this.$emit("vf_update", v_field);

      return null;
    },
    syncItem() {
      if (this.editedIndex == -1) {
        this.ec.data.push(this.editedItem);
        this.update();
      } else {
        this.ec.data[this.editedIndex] = this.editedItem;
        this.update();
      }
      this.editDialog = false;
    },
    async update() {
      console.log(`floEcJson - update - ec`);
      console.log(this.ec);
      this.$emit("update", this.ec);
    },
    setDeleteItem(item) {
      this.itemForDeletion = item;
      this.deleteDialog = true;
    },
    async deleteItem() {
      if (this.ec != null) {
        const index = this.ec.data.indexOf(this.itemForDeletion);
        this.ec.data.splice(index, 1);
      }

      this.update();
      this.deleteDialog = false;
    },
    async initialize() {
      console.log(`floEcJson - initialize`);
      this.ec = this.value;
      this.loadTableStructure();
    },
    loadTableStructure() {
      let lheaders = [
        { text: "Url", align: "center", sortable: false, value: "url", view: true },
        { text: "Name", align: "center", sortable: false, value: "name", view: true },
        { text: "Sfi", align: "center", sortable: false, value: "sfi", view: true },
        { text: "Type", align: "center", sortable: false, value: "type", view: true },
        { text: "Recno", align: "center", sortable: false, value: "recno", view: true },
        { text: "Recsize", align: "center", sortable: false, value: "recsize", view: true },
        { text: "Size", align: "center", sortable: false, value: "size", view: true },
        { text: "Content", align: "center", sortable: false, value: "content", view: true },
        { text: "Actions", value: "action", sortable: false, align: "center" },
      ];
      this.editedItem = this.shallowCopy();
      this.headers = lheaders;
    },
    closeDialog() {
      this.editDialog = false;
      this.$nextTick(() => {
        this.editedItem = this.shallowCopy();
        this.editedIndex = -1;
      });
    },
    formatData(data) {
      if (data.length > 60) {
        return `${data.substring(0, 60)}...`;
      }
      return data;
    },
    calculateSize() {
      let size = this.editedItem.recno * this.editedItem.recsize;
      this.editedItem.size = size;
    },
    getTypeIcon(type) {
      switch (type) {
        case "MF":
          return "mdi-file-tree";
        case "LF":
          return "mdi-format-list-numbered";
        case "DF":
          return "mdi-folder-outline";
        case "TR":
          return "mdi-file-outline";
        case "LNK":
          return "mdi-link";
        case "CYC":
          return "mdi-recycle";
        default:
          return "";
      }
    },
    shallowCopy() {
      let lbase = {
        url: "",
        type: "TR",
        size: "",
        sfi: "",
        secure: "",
        recsize: "",
        recno: "1",
        name: "",
        inter: "",
        ota: {
          activate: "No",
          deactivate: "No",
          delete: "No",
          increase: "No",
          read: "No",
          resize: "No",
          update: "No",
        },
        access: {
          activate: "Nev",
          deactivate: "Nev",
          delete: "Nev",
          increase: "Nev",
          read: "Nev",
          resize: "Nev",
          update: "Nev",
        },
        content: [
          {
            id: "",
            data: "",
          },
        ],
      };
      return JSON.parse(JSON.stringify(lbase));
    },
  },
};
</script>
