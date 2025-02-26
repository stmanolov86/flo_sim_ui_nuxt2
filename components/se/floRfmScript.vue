<template>
  <div class="flo-rfm-script">
    <v-container fluid class="ma-0 pa-0" v-if="!loading">
      <v-row no-gutters>
        <v-col cols="12">
          <flo-position-control :items="operations" :value="operation" :multiple="true" :readonly="readonly" :disabled="disabled">
            <template v-slot:content="{ item, idx: i }">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-rfm-misc @change="onMiscChange($event, i)" :aids="getUiccAids()" :value="value" :transport="transport" :readonly="readonly" :disabled="disabled" :use_cla="false" :use_base="false" />
                  </v-col>
                </v-row>

                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <flo-position-control :items="item.script" :value="val" :multiple="true" :readonly="readonly" :disabled="disabled">
                      <template v-slot:content="{ item, idx }">
                        <v-container fluid class="ma-0 pa-1">
                          <v-row no-gutters>
                            <v-col cols="12">
                              <v-text-field :value="item.a" :label="meta.apdu.label" :type="meta.apdu.type" :rules="meta.apdu.rule" :disabled="disabled || readonly" @input="onApduChanged($event, idx, i)" hide-details outlined dense></v-text-field>
                            </v-col>
                          </v-row>
                        </v-container>
                      </template>
                    </flo-position-control>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </flo-position-control>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floPositionControl from "~/components/widgets/floPositionControl.vue";
export default {
  name: "flo-rfm-script",
  components: {
    floPositionControl,
  },
  data() {
    return {
      loading: true,
      val: { a: "" },
      operations: [],
      operation: {
        type: "script",
        script: [{ a: "" }],
      },
      meta: {
        apdu: {
          label: "APDU",
          input: "text",
          type: "text",
          rule: [(v) => (/^[0-9A-Fa-f]+$/.test(v) && /^(..)*$/.test(v)) || "Field accepts only HEX and it must be even length."],
        },
      },
    };
  },
  props: {
    uicc: {
      type: Object,
      default: () => {},
    },
    value: {
      type: [Object, Array],
      default: null,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    operations: {
      handler() {
        this.syncParent();
      },
      deep: true,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.loading = true;
      console.log(`flo-rfm-script - initialize - enter`);
      if (null == this.value) {
        console.log(`flo-rfm-script - initialize - value is null`);
        this.add();
        this.syncParent();
      } else {
        if (undefined != this.value.length) {
          this.value.forEach((val) => {
            this.operations.push(val);
          });
        } else {
          this.add();
          this.operations[0].script = this.value.script;
        }
      }
      this.loading = false;
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    syncParent() {
      this.$emit("change", this.operations);
    },
    onApduChanged(apdu, idx, i) {
      let lapdu = { a: apdu };
      this.operations[i].script[idx] = lapdu;
      this.syncParent();
    },
    onMiscChange(event, i) {
      console.log(`flo-rfm-script - onMiscChange: ${JSON.stringify(event)}`);
      if (event) {
        this.operations[i] = { ...this.operations[i], app: event.app };
      }
      console.log(`flo-rfm-script - onMiscChange: ${JSON.stringify(this.operation)}`);
      this.syncParent();
    },
    add() {
      this.operations.push({
        type: "script",
        script: [{ a: "" }],
      });
    },
  },
};
</script>
