<template>
  <div class="flo-meta-update">
    <v-card>
      <v-card-title>
        <span class="headline">{{ title }}</span>
      </v-card-title>

      <v-card-text>
        <v-container>
          <v-row>
            <v-col cols="12">
              <flo-meta-tree :tree-data="getHeaderTree(headers)">
                <template v-slot:item="{ item, idx }">
                  <template v-if="!hideDisabled(editedIndex, item)">
                    <slot :name="`edit_${item.value}`" :fmtheader="item" :fmtheaders="headers" :fmtrow="value" :fmtidx="editedIndex">
                      <v-col v-if="item.value != 'action' && item.value != 'attach'" cols="12" lg="6" :key="idx">
                        <flo-meta-field-edit :translator="translator" :pattern="item.pattern" :disabled="disableEdit(editedIndex, item)" v-model="value[item.value]" :header="item"></flo-meta-field-edit>
                      </v-col>
                    </slot>
                  </template>
                  <template v-else>
                    <div></div>
                  </template>
                </template>
              </flo-meta-tree>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-snackbar :timeout="4000" v-model="errorSnackbar" absolute color="error">
        <span>{{ errorMessage }}</span>
        <template v-slot:action="{ attrs }">
          <v-btn icon v-bind="attrs" @click="errorSnackbar = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </template>
      </v-snackbar>

      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn v-if="allowSave()" color="primary" text @click="save()">Save</v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import floMetaTree from "./floMetaTree";
import floMetaFieldEdit from "~/components/crud/floMetaFieldEdit.vue";
export default {
  name: "flo-meta-update",
  components: {
    floMetaTree,
    floMetaFieldEdit,
  },
  data: function () {
    return {
      errorSnackbar: false,
      errorMessage: "",
      editedIndex: 0,
    };
  },
  props: {
    // v-model prop is always value
    value: {
      type: [String, Number, Object, Boolean],
      required: false,
      default: null,
    },
    title: {
      type: [String],
      required: false,
      default: null,
    },
    headers: {
      type: [Array],
      required: true,
      default: null,
    },
  },
  methods: {
    allowSave() {},
    save() {},
    getHeaderTree() {},
  },
};
</script>
