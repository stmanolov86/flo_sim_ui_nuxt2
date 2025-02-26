<template>
  <div class="flo-hsm-encryption">
    <v-container fluid class="ma-0 pa-0">
      <template v-if="resourceTabs()">
        <v-row no-gutters>
          <v-col cols="12" lg="6" xl="6" class="pa-1">
            <flo-account-select v-model="path" label="Path" hint="Access Path" dense persistent_hint outlined :filled="false" />
          </v-col>
          <v-col cols="12" lg="6" xl="6" class="pa-1">
            <v-select v-model="ota_wrap_mode.value" :label="ota_wrap_mode.label" :hint="ota_wrap_mode.hint" :items="filteredWrapMode()" :disabled="lockWrapMode()" @change="onChange($event)" item-text="value" item-value="key" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
          </v-col>
        </v-row>

        <v-row v-if="ota_wrap_mode.value != 'none'" no-gutters>
          <v-col cols="12" lg="6" xl="6" class="pa-1">
            <v-autocomplete v-model="hsms.value" :label="hsms.label" :hint="hsms.hint" :items="hsms.items" :disabled="resources == 'hsm_keys'" item-text="value" item-value="key" @change="loadHsmKeys($event)" dense persistent-hint outlined></v-autocomplete>
          </v-col>
          <v-col v-if="hasTk()" cols="12" lg="6" xl="6" class="pa-1">
            <v-autocomplete v-model="tk.value" :label="tk.label" :hint="tk.hint" :items="tk.items" @change="onChange($event)" item-text="value" item-value="key" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
          </v-col>
        </v-row>
      </template>
      <template v-else-if="deleteAction()">
        <v-row no-gutters>
          <v-col cols="12" class="ma-2 pa-2">
            <v-switch v-model="delete_keys.value" :hint="delete_keys.hint" :label="delete_keys.label" @change="onChange($event)" color="success" inset persistent-hint></v-switch>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>

<script>
import floAccountSelect from "~/components/select/floAccountSelect";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  name: "flo-hsm-encryption",
  components: {
    floAccountSelect,
  },
  data: () => ({
    path: ",1,",
    hsms: {
      label: "HSM",
      hint: "This value will override the HSM in the file.",
      items: [],
      value: 0,
    },
    ota_wrap_mode: {
      label: "Encryption Mode",
      hint: "Keys Encryption Mode",
      value: "none",
    },
    tk: {
      label: "TK",
      hint: "Select Transport Key",
      items: [],
      value: 0,
    },
    delete_keys: {
      label: "Delete HSM Keys",
      hint: "Deleting may take some time. Please verify that the keys were deleted before adding new ones.",
      value: true,
    },
  }),
  props: {
    resources: {
      type: String,
      required: true,
    },
    tabs: {
      type: Number,
      required: true,
    },
    dialog: {
      type: Boolean,
      required: true,
    },
    hsm_id: {
      default: "",
      type: String,
      required: false,
    },
  },
  watch: {
    dialog: {
      immediate: true,
      handler(val) {
        if (!val) {
          this.path = ",1,";
          this.hsms.value = 0;
          this.tk.value = 0;
          this.delete_keys.value = true;
        }
        this.ota_wrap_mode.value = this.resources == "subscribers" ? "none" : "raw";
      },
    },
  },
  created() {
    this.initialize();
  },
  mixins: [parseNetError, tellUser],
  methods: {
    async initialize() {
      await this.loadHsms();
      if (this.hsm_id) {
        this.hsms.value = +this.hsm_id;
        if (this.resources == "hsm_keys") {
          this.onChange();
          await this.loadTk(this.hsms.value);
        }
      }
    },
    hasTk() {
      return (this.resources == "subscribers" || this.resources == "hsm_keys") && !(this.ota_wrap_mode.value == "raw" || this.ota_wrap_mode.value == "none");
    },
    resourceTabs() {
      return (this.resources == "subscribers" && this.tabs != 2) || (this.resources == "hsm_keys" && this.tabs != 2);
    },
    lockWrapMode() {
      if (this.resources == "subscribers" && this.tabs == 1) {
        this.ota_wrap_mode.value = "none";
        this.onChange();
        return this.tabs == 1;
      }

      return false;
    },
    deleteAction() {
      return this.resources == "subscribers" && this.tabs == 2;
    },
    filteredWrapMode() {
      let items = [
        { key: "none", value: "None" },
        { key: "raw", value: "Raw" },
        { key: "wrapped", value: "Wrapped" },
        { key: "encrypted", value: "Encrypted" },
      ];
      return this.resources == "hsm_keys" ? items.filter((f) => f.key == "raw" || f.key == "wrapped") : items;
    },
    onChange() {
      let data = { path: this.path, ota_wrap_mode: this.ota_wrap_mode.value, hsm_id: this.hsms.value };

      if (this.hasTk()) {
        data["tk"] = this.tk.value;
      }
      if (this.deleteAction()) {
        data["delete_keys"] = this.delete_keys.value;
      }
      this.$emit("change", data);
    },
    async loadHsms() {
      try {
        let hsms = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.hsms.items = hsms;
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsmKeys(id) {
      await this.loadTk(id);
      this.onChange();
    },
    async loadTk(id) {
      this.tk.value = 0;
      this.tk.items = [];
      try {
        let query = {
          select: {
            id: {},
            name: {},
          },
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: id,
            },
            {
              k: "key_type",
              op: "equal",
              v: "tk",
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };

        this.tk.items = (await this.$axios.$post("api/v1/hsm_keys/list", query)).map(({ id, name }) => ({
          key: id,
          value: name,
        }));
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
  },
};
</script>
