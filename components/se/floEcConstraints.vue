<template>
  <div class="flo-ec-constraints">
    <v-card flat outlined>
      <v-container>
        <v-card-title>
          <span class="headline">{{ formatTitle(value.resources) }} Constraints</span>
        </v-card-title>
        <v-card-text>
          <v-data-table :headers="value.constraint_headers" :items="value.constraints.ec" :search="value.constraint_search" :key="version" class="resourcetable elevation-0">
            <template v-slot:top>
              <v-row no-gutters class="ma-1 pa-1">
                <v-col cols="12" lg="4" xl="4"><v-text-field v-model="value.constraint_search" append-icon="mdi-magnify" label="Search" single-line hide-details></v-text-field></v-col>
                <div class="flex-grow-1"></div>
                <v-col offset="3" class="mt-4">
                  <v-btn v-if="!readonly && !disabled" color="primary" @click="newItem()">
                    <v-icon left>mdi-plus</v-icon>
                    New Constraint
                  </v-btn>
                </v-col>
              </v-row>
            </template>
            <template v-slot:item="row">
              <template v-if="$vuetify.breakpoint.smAndUp">
                <tr>
                  <td v-for="header in row.headers" :key="`rconst-${row.index}-${header.value}`" :class="`text-${typeof header.align === 'undefined' ? 'center' : header.align}`">
                    <template v-if="header.value == 'action'">
                      <v-container class="d-flex flex-row justify-center align-center ma-0 pa-0">
                        <div class="flex-grow-1"></div>
                        <v-btn v-if="!readonly && !disabled" class="ma-2" color="primary" @click="editItem(row.item)"><v-icon left>mdi-pencil</v-icon>Edit</v-btn>
                        <v-btn v-else class="ma-2" color="primary" @click="editItem(row.item)"><v-icon left>mdi-more</v-icon>View</v-btn>
                        <v-btn v-if="!readonly && !disabled" color="primary" @click="setDeleteItem(row.item)">
                          <v-icon center>mdi-delete</v-icon>
                        </v-btn>
                      </v-container>
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
                                  <v-btn v-if="!readonly" fab small color="primary" @click="editItem(row.item)"><v-icon>mdi-pencil</v-icon></v-btn>
                                  <v-btn v-else fab small color="primary" @click="editItem(row.item)"><v-icon>mdi-more</v-icon></v-btn>
                                  <v-btn v-if="!readonly" fab small color="primary" @click="setDeleteItem(row.item)">
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
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="closeDialog()">Cancel</v-btn>
        </v-card-actions>
      </v-container>
    </v-card>
    <v-dialog :overlay-opacity="0.4" v-model="editDialog" scrollable max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">Edit Constraint</span>
        </v-card-title>

        <v-card-text>
          <v-container>
            <v-row>
              <template v-for="(header, i) in value.constraint_headers">
                <v-col v-if="header.value != 'action' && header.value != 'type' && header.value != 'size'" cols="6" :key="i">
                  <v-text-field :disabled="readonly || disabled" v-model="value.editedItem[header.value]" :label="header.text" @blur="calculateSize()"></v-text-field>
                </v-col>
                <v-col :key="`a-${i}`" cols="6" v-if="header.value == 'type'">
                  <v-select :disabled="readonly || disabled" v-model="value.editedItem[header.value]" :label="header.text" required item-text="key" item-value="value" :items="type" filled></v-select>
                </v-col>
                <v-col :key="`ab-${i}`" cols="6" v-if="header.value == 'size'">
                  <v-text-field disabled v-model="value.editedItem[header.value]" :label="header.text"></v-text-field>
                </v-col>
              </template>
            </v-row>
          </v-container>
        </v-card-text>

        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="editDialog = false">Cancel</v-btn>
          <v-btn v-if="!readonly && !disabled" color="primary" text @click="syncItem()">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog :overlay-opacity="0.4" v-model="deleteDialog" width="auto ">
      <v-card>
        <v-card-title>Are you sure you want to delete this constraint?</v-card-title>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="deleteItem()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-ec-constraints",
  data() {
    return {
      type: [
        { key: "TR", value: "TR" },
        { key: "DF", value: "DF" },
        { key: "LF", value: "LF" },
        { key: "MF", value: "MF" },
        { key: "LNK", value: "LNK" },
        { key: "CYC", value: "CYC" },
      ],
      version: 1,
      editDialog: false,
      deleteDialog: false,
      itemForDeletion: {},
    };
  },
  props: {
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
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  mixins: [tellUser, parseNetError],
  methods: {
    editItem(item) {
      this.value.editedIndex = this.value.constraints.ec.indexOf(item);
      this.value.editedItem = Object.assign({}, item);
      this.editDialog = true;
    },
    newItem() {
      this.value.editedItem = this.shallowCopy();
      this.editDialog = true;
    },
    syncItem() {
      if (this.value.editedIndex == -1) {
        this.value.constraints.ec.push(this.value.editedItem);
        this.update();
      } else {
        this.value.constraints.ec[this.value.editedIndex] = this.value.editedItem;
        this.update();
      }
      this.editDialog = false;
    },
    async update() {
      this.$emit("update", this.value);
    },
    setDeleteItem(item) {
      this.itemForDeletion = item;
      this.deleteDialog = true;
    },
    async deleteItem() {
      const index = this.value.constraints.ec.indexOf(this.itemForDeletion);
      this.value.constraints.ec.splice(index, 1);
      this.update();
      this.deleteDialog = false;
    },
    closeDialog() {
      this.$emit("close-dialog", false);
      this.$nextTick(() => {
        this.value.editedItem = this.shallowCopy();
        this.value.editedIndex = -1;
      });
    },
    shallowCopy() {
      let lbase = {
        url: "",
        type: "TR",
        recsize: "",
        recno: "1",
        size: "",
      };
      return JSON.parse(JSON.stringify(lbase));
    },
    formatTitle(resources) {
      switch (resources) {
        case "applet_subs":
          return "Subscribers";
        case "applet_settings":
          return "Settings";
        case "applet_keys":
          return "Keys";
      }
    },
    calculateSize() {
      let size = this.value.editedItem.recno * this.value.editedItem.recsize;
      this.value.editedItem.size = size;
    },
  },
};
</script>
