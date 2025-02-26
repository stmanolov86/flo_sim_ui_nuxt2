<template>
  <div class="flo-vf-enums">
    <v-card flat outlined :disabled="readonly">
      <v-card-title
        >Enumerators
        <div class="flex-grow-1"></div>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-btn color="primary" class="mb-n1" @click="addDataType(null, null)" v-on="on">
              <v-icon center>mdi-plus</v-icon>
            </v-btn>
          </template>
          <span>Add Enumerator</span>
        </v-tooltip></v-card-title
      >
      <v-card-text>
        <template v-for="(data_type, idx) in data_type_ex">
          <v-row no-gutters :key="idx">
            <v-col v-for="(enumerator, i) in Object.values(data_type.enumerator)" cols="12" lg="5" xl="5" class="pa-1" :key="i">
              <v-text-field v-model="enumerator.value" @input="syncParent()" :label="enumerator.label" :type="enumerator.type" :rules="enumerator.rule" :hint="enumerator.hint" persistent-hint outlined dense></v-text-field>
            </v-col>
            <div class="flex-grow-1"></div>
            <v-btn icon @click="deleteDataType(idx)" class="mb-5">
              <v-icon color="error" size="30">mdi-delete</v-icon>
            </v-btn>
          </v-row>
        </template>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "flo-vf-enums",
  data() {
    return {
      edit_card_vfields: null,
      data_type_ex: [],
    };
  },
  props: {
    card_vfields: {
      type: Object,
      default: null,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.edit_card_vfields = this.card_vfields;
      if (null != this.edit_card_vfields) {
        if (null != this.edit_card_vfields.data_type_ex && "" != this.edit_card_vfields.data_type_ex) {
          let ldata = JSON.parse(this.edit_card_vfields.data_type_ex);
          ldata.forEach((data) => {
            this.addDataType(data.key, data.value);
          });
        } else {
          this.addDataType(null, null);
        }
      }
    },
    syncParent() {
      this.edit_card_vfields.data_type_ex = this.data_type_ex.map((ex) => {
        return { key: ex.enumerator.key.value, value: ex.enumerator.value.value };
      });
      console.log(`flo-vf-enums - syncParent - ${JSON.stringify(this.edit_card_vfields.data_type_ex)}`);
      this.$emit("change", this.edit_card_vfields.data_type_ex);
    },
    addDataType(key, value) {
      this.data_type_ex.push({
        enumerator: {
          key: {
            label: "Key",
            hint: "Enumerator Key",
            input: "text",
            type: "text",
            value: key ? key : "",
            rule: [(v) => /^\w+$/.test(v) || "Field accepts only alphanumeric characters and is required."],
          },
          value: {
            label: "Value",
            hint: "Enumerator Value",
            input: "text",
            type: "text",
            value: value ? value : "",
            rule: [(v) => /^\w+$/.test(v) || "Field accepts only alphanumeric characters and is required."],
          },
        },
      });
    },
    deleteDataType(idx) {
      this.data_type_ex.splice(idx, 1);
      this.syncParent();
    },
  },
};
</script>
