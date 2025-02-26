<template>
  <div class="flo-scp-ex-info">
    <flo-expand :open="lopen" @collapse="lopen = $event" @expand="lopen = $event" title="Execution Information" elevation="5">
      <template v-slot:append="{}" v-if="!lopen">
        <v-spacer v-for="n in 30" :key="n"></v-spacer>
        <v-chip class="mr-1" label>Message Mode: {{ getMessageMode(meta.message_mode.value) }}</v-chip>
        <v-chip class="mr-1" label>Wait Registration Timeout: {{ helpers.secondsToTime(meta.wait_registration_timeout.value) }}</v-chip>
        <v-chip v-if="meta.message_mode.value == 'store_and_forward'" label>Validity Period: {{ helpers.secondsToTime(meta.validity_period.value) }}</v-chip>
      </template>
      <template v-slot:content="{}">
        <v-card flat :disabled="disabled">
          <v-container fluid>
            <v-row no-gutters>
              <v-col cols="12" lg="2" xl="2" class="pa-1">
                <v-select :disabled="readonly" v-model="meta.message_mode.value" :label="meta.message_mode.label" :type="meta.message_mode.type" :rules="meta.message_mode.rule" :hint="meta.message_mode.hint" :items="meta.message_mode.items" item-text="value" item-value="key" outlined dense persistent-hint @change="syncParent($event)"></v-select>
              </v-col>
              <v-col v-if="meta.message_mode.value == 'store_and_forward'" cols="12" lg="2" xl="2" class="pa-1">
                <v-text-field :disabled="readonly" v-model="meta.validity_period.value" :label="meta.validity_period.label" :rules="meta.validity_period.rule" :hint="formatValidityPeriodHint(meta.validity_period.value)" outlined dense persistent-hint @input="syncParent($event)"></v-text-field>
              </v-col>
              <v-col cols="12" lg="2" xl="2" class="pa-1">
                <v-text-field :disabled="readonly" v-model="meta.wait_registration_timeout.value" :label="meta.wait_registration_timeout.label" :rules="meta.wait_registration_timeout.rule" :hint="formatTimeoutHint(meta.wait_registration_timeout.value)" outlined dense persistent-hint @input="syncParent($event)"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </template>
    </flo-expand>
  </div>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-scp-ex-info",
  data() {
    return {
      helpers,
      lopen: false,
      meta: {
        message_mode: {
          label: "Message Mode",
          hint: "Select Message Mode",
          input: "text",
          type: "text",
          value: "direct",
          items: [
            { key: "direct", value: "Direct" },
            { key: "store_and_forward", value: "Store And Forward" },
          ],
          rule: [(v) => !!v || "Field is required."],
        },
        wait_registration_timeout: {
          label: "Wait Registration Timeout",
          input: "text",
          type: "text",
          value: "189216000",
          rule: [(v) => (v >= 0 && v <= 189216000) || "Maximum Wait Registration Timeout is six years."],
        },
        validity_period: {
          label: "Validity Period",
          input: "text",
          type: "text",
          value: "600",
          rule: [(v) => (v >= 0 && v <= 604800) || "Maximum Validity Period is one week."],
        },
      },
    };
  },
  props: {
    value: {
      type: Object,
      default: () => {},
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    transport: {
      type: String,
      required: true,
      default: "",
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    syncParent() {
      let operation = null;
      if (this.meta.message_mode.value == "direct") {
        operation = { mode: "execute", message_mode: this.meta.message_mode.value, wait_registration_timeout: this.meta.wait_registration_timeout.value };
        this.$emit("change", operation);
      } else {
        operation = { mode: "execute", message_mode: this.meta.message_mode.value, validity_period: this.meta.validity_period.value, wait_registration_timeout: this.meta.wait_registration_timeout.value };
        this.$emit("change", operation);
      }
    },
    syncExpand() {
      if (this.lopen != false) {
        this.lopen = false;
        this.lopen_key++;
      }
    },
    initialize() {
      console.log(`flo-scp-ex-info - initialize - ${JSON.stringify(this.value)}`);
      this.lopen = this.open;
      if (null == this.value) {
        this.syncParent();
      } else {
        this.meta.message_mode.value = this.value.message_mode;
        this.meta.validity_period.value = this.value.validity_period;
        this.meta.wait_registration_timeout.value = this.value.wait_registration_timeout;
      }
    },
    getMessageMode(mode) {
      let filtered = "";
      filtered = this.meta.message_mode.items.filter((m) => m.key == mode);
      if (filtered.length > 0) {
        return filtered[0].value;
      }

      return filtered;
    },
    formatTimeoutHint(timeout) {
      let hint = "Timeout in seconds, specify 0 for immediate execution.";
      let formatted = helpers.secondsToTime(timeout);
      if (formatted) {
        hint = `${formatted} - or set to 0 for immediate execution.`;
      }

      return hint;
    },
    formatValidityPeriodHint(period) {
      let hint = "Period in seconds, specify 0 for immediate execution.";
      let formatted = helpers.secondsToTime(period);
      if (formatted) {
        hint = `${formatted} - or set to 0 for immediate execution.`;
      }

      return hint;
    },
  },
};
</script>
