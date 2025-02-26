<template>
  <div class="flo-ram-keys">
    <v-container class="ma-0 pa-0" fluid v-if="!loading">
      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-rfm-misc @change="onMiscChange($event)" :aids="getUiccAids()" :value="get_first_op()" :transport="transport" :disabled="disabled" :readonly="readonly" :use_cla="false" :use_base="false" aid_category="ISD" />
        </v-col>
      </v-row>

      <v-dialog :overlay-opacity="0.4" v-model="dialog_add_keyset" scrollable max-width="500px">
        <v-card v-if="null != add_keyset_op">
          <v-card-title>
            <span class="headline">Add Keyset</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-select :value="getOpScp(add_keyset_op)" label="SCP" hint="Select SCP 80 or 81" :items="scps" item-text="value" item-value="key" @change="setAddOpScp(add_keyset_op, $event)" persistent-hint outlined dense></v-select>
                </v-col>

                <v-col cols="12" class="pa-1">
                  <flo-kset :key="redraw_add_keyset" :keysets="getAddKeysets(getOpScp(add_keyset_op))" :value="getOpNKvn(add_keyset_op)" @change="setOpNKvn(add_keyset_op, $event)" :prefix="getOpScp(add_keyset_op) == '80' ? 'SCP80' : 'SCP81'" />
                </v-col>
                <!-- <v-col cols="12" class="pa-1">
                  <v-select :value="getAlgoItem()" @change="setAlgoItem($event)" :items="algo_items" :readonly="readonly" :disabled="disabled" label="Algorithm" hint="Select Algorithm" item-text="value" item-value="key" persistent-hint outlined dense></v-select>
                </v-col> -->
                <v-col v-if="opHasKey(add_keyset_op, 'kic')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(add_keyset_op), 'kic')" :value="getOpKeyName(add_keyset_op, 'kic')" @input="setOpKey(add_keyset_op, 'kic', $event)" @change="setOpKey(add_keyset_op, 'kic', $event)" :disabled="disabled" :readonly="readonly" label="KIC" hint="Key for Ciphering" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(add_keyset_op, 'kid')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(add_keyset_op), 'kid')" :value="getOpKeyName(add_keyset_op, 'kid')" @input="setOpKey(add_keyset_op, 'kid', $event)" @change="setOpKey(add_keyset_op, 'kid', $event)" :disabled="disabled" :readonly="readonly" label="KID" hint="Key for RC/CC/DS" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(add_keyset_op, 'dek')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(add_keyset_op), 'dek')" :value="getOpKeyName(add_keyset_op, 'dek')" @input="setOpKey(add_keyset_op, 'dek', $event)" @change="setOpKey(add_keyset_op, 'dek', $event)" :disabled="disabled" :readonly="readonly" label="DEK" hint="Data Encryption Key" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(add_keyset_op, 'tlspsk')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(add_keyset_op), 'tlspsk')" :value="getOpKeyName(add_keyset_op, 'tlspsk')" @input="setOpKey(add_keyset_op, 'tlspsk', $event)" @change="setOpKey(add_keyset_op, 'tlspsk', $event)" :disabled="disabled" :readonly="readonly" label="TLSPSK" hint="Transport Layer Security Pre-Shared Key Ciphersuites" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(add_keyset_op, 'tlsdek')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(add_keyset_op), 'tlsdek')" :value="getOpKeyName(add_keyset_op, 'tlsdek')" @input="setOpKey(add_keyset_op, 'tlsdek', $event)" @change="setOpKey(add_keyset_op, 'tlsdek', $event)" :disabled="disabled" :readonly="readonly" label="TLSDEK" hint="Transport Layer Security Data Encryption Key" persistent-hint outlined dense></v-combobox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="cancelAddKeysetDialog()">Cancel</v-btn>
            <v-btn v-if="getAddKeysets(getOpScp(add_keyset_op)).length > 0" color="primary" text @click="saveAddKeysetDialog()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog :overlay-opacity="0.4" v-model="dialog_replace_keyset" scrollable max-width="500px">
        <v-card v-if="null != replace_keyset_op">
          <v-card-title>
            <span class="headline">Replace Keyset</span>
          </v-card-title>

          <v-card-text>
            <v-container>
              <v-row no-gutters>
                <v-col cols="12" class="pa-1">
                  <v-select :value="getOpScp(replace_keyset_op)" disabled label="SCP" hint="Select SCP 80 or 81" :items="scps" item-text="value" item-value="key" @change="setAddOpScp(replace_keyset_op, $event)" persistent-hint outlined dense></v-select>
                </v-col>

                <v-col cols="12" class="pa-1">
                  <flo-kset :value="getOpNKvn(replace_keyset_op)" disabled @change="setOpNKvn(replace_keyset_op, $event)" :keysets="getReplaceKeysets(getOpScp(replace_keyset_op))" :prefix="getOpScp(replace_keyset_op) == '80' ? 'SCP80' : 'SCP81'" />
                </v-col>

                <v-col v-if="opHasKey(replace_keyset_op, 'kic')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(replace_keyset_op), 'kic')" :value="getOpKeyName(replace_keyset_op, 'kic')" @input="setOpKey(replace_keyset_op, 'kic', $event)" @change="setOpKey(replace_keyset_op, 'kic', $event)" :disabled="disabled" :readonly="readonly" label="KIC" hint="Key for Ciphering" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(replace_keyset_op, 'kid')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(replace_keyset_op), 'kid')" :value="getOpKeyName(replace_keyset_op, 'kid')" @input="setOpKey(replace_keyset_op, 'kid', $event)" @change="setOpKey(replace_keyset_op, 'kid', $event)" :disabled="disabled" :readonly="readonly" label="KID" hint="Key for RC/CC/DS" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(replace_keyset_op, 'dek')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(replace_keyset_op), 'dek')" :value="getOpKeyName(replace_keyset_op, 'dek')" @input="setOpKey(replace_keyset_op, 'dek', $event)" @change="setOpKey(replace_keyset_op, 'dek', $event)" :disabled="disabled" :readonly="readonly" label="DEK" hint="Data Encryption Key" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(replace_keyset_op, 'tlspsk')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(replace_keyset_op), 'tlspsk')" :value="getOpKeyName(replace_keyset_op, 'tlspsk')" @input="setOpKey(replace_keyset_op, 'tlspsk', $event)" @change="setOpKey(replace_keyset_op, 'tlspsk', $event)" :disabled="disabled" :readonly="readonly" label="TLSPSK" hint="Transport Layer Security Pre-Shared Key Ciphersuites" persistent-hint outlined dense></v-combobox>
                </v-col>
                <v-col v-if="opHasKey(replace_keyset_op, 'tlsdek')" cols="12" class="pa-1">
                  <v-combobox :items="getAllKeysets(getOpNKvn(replace_keyset_op), 'tlsdek')" :value="getOpKeyName(replace_keyset_op, 'tlsdek')" @input="setOpKey(replace_keyset_op, 'tlsdek', $event)" @change="setOpKey(replace_keyset_op, 'tlsdek', $event)" :disabled="disabled" :readonly="readonly" label="TLSDEK" hint="Transport Layer Security Data Encryption Key" persistent-hint outlined dense></v-combobox>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions>
            <div class="flex-grow-1"></div>
            <v-btn color="primary" text @click="cancelReplaceKeysetDialog()">Cancel</v-btn>
            <v-btn color="primary" text @click="saveReplaceKeysetDialog()">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-row no-gutters align="end" justify="end">
        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
          <v-btn color="primary" @click="openAddKeysetDialog()" :disabled="disabled" class="mx-1">
            <v-icon :left="true">mdi-key-chain</v-icon>
            {{ "New Keyset" }}
          </v-btn>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12" class="pa-1">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters :key="`kvn-list`">
              <v-col cols="12" class="pa-0">
                <v-container fluid class="d-flex flex-nowrap align-left justify-left ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                      <v-switch :input-value="getListOp()" dense @change="setListOp($event)" class="subheading font-weight-light" color="success" label="Read Key Store" persistent-hint hint="Read Card Key Store"></v-switch>
                    </v-col>
                    <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                      <v-switch :disabled="!hasListOp()" :input-value="getListOpUpdate()" dense @change="setListOpUpdate($event)" class="subheading font-weight-light" color="success" label="Update" persistent-hint hint="Update On Success"></v-switch>
                    </v-col>
                  </v-row>
                </v-container>
              </v-col>
            </v-row>

            <template v-for="(okset, i) in getCardKeysetsMerged()">
              <v-row no-gutters :key="`kvn-${i}`">
                <v-col cols="12" class="pa-1">
                  <flo-expand title="" elevation="0">
                    <template v-slot:title="{}">
                      <span class="title font-weight-regular ma-0 pa-0"></span>
                    </template>

                    <template v-slot:append="{}">
                      <v-chip class="mx-1 text-uppercase" :color="okset.scp == '80' ? 'secondary' : 'accent'" label>SCP: {{ okset.scp }}</v-chip>
                      <v-chip class="mx-1 text-uppercase" :color="okset.scp == '80' ? 'secondary' : 'accent'" label>KEYSET: {{ okset.keyset }}</v-chip>
                      <v-chip class="mx-1 text-uppercase" :color="getKeyStoreStateColor(okset.state)" label>{{ okset.state }}</v-chip>
                    </template>

                    <template v-slot:content="{}">
                      <v-card flat>
                        <v-container fluid class="ma-0 pa-0">
                          <v-row no-gutters>
                            <v-col cols="12" class="pa-1">
                              <v-container fluid class="ma-0 pa-0">
                                <template v-for="(okeyid, j) in okset.keys">
                                  <v-row no-gutters :key="`keyid-${j}`">
                                    <v-col cols="1" class="pa-1">
                                      <v-text-field persistent-hint outlined readonly dense class="font-weight-light primary--text" :value="okeyid.keyid" label="Id" hint="Key Id"></v-text-field>
                                    </v-col>

                                    <template v-if="okeyid.name == 'unknown'">
                                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                        <v-chip label color="warning" class="text-uppercase py-5">
                                          <v-icon left>mdi-alert-octagon-outline</v-icon>
                                          {{ okeyid.name }}</v-chip
                                        >
                                      </v-col>
                                    </template>
                                    <template v-else-if="okeyid.name == 'generate'">
                                      <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                        <v-chip label color="success" class="text-uppercase py-5">
                                          <v-icon left>mdi-key-plus</v-icon>
                                          {{ okeyid.name }}</v-chip
                                        >
                                      </v-col>
                                    </template>
                                    <template v-else>
                                      <v-col cols="3" class="pa-1">
                                        <v-form autocomplete="off">
                                          <v-text-field v-if="okeyid.key_type == 'kic'" persistent-hint outlined readonly dense class="font-weight-light primary--text" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="okeyid.name" label="KIC" hint="Key for Ciphering"></v-text-field>
                                          <v-text-field v-if="okeyid.key_type == 'kid'" persistent-hint outlined readonly dense class="font-weight-light primary--text" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="okeyid.name" label="KID" hint="Key for RC/CC/DS"></v-text-field>
                                          <v-text-field v-if="okeyid.key_type == 'dek'" persistent-hint outlined readonly dense class="font-weight-light primary--text" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="okeyid.name" label="DEK" hint="Data Encryption Key"></v-text-field>
                                          <v-text-field v-if="okeyid.key_type == 'tlspsk'" persistent-hint outlined readonly dense class="font-weight-light primary--text" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="okeyid.name" label="TLSPSK" hint="Transport Layer Security Pre-Shared Key Ciphersuites"></v-text-field>
                                          <v-text-field v-if="okeyid.key_type == 'tlsdek'" persistent-hint outlined readonly dense class="font-weight-light primary--text" :append-icon="password ? 'mdi-eye' : 'mdi-eye-off'" @click:append="password = !password" :type="password ? 'text' : 'password'" :value="okeyid.name" label="TLSDEK" hint="Transport Layer Security Data Encryption Key"></v-text-field>
                                        </v-form>
                                      </v-col>
                                    </template>

                                    <v-col cols="3" class="pa-1">
                                      <v-text-field persistent-hint outlined readonly dense class="font-weight-light primary--text" :value="getAlgoItems(okeyid.alg)" label="Algorithm" hint="Algorithm DES3, AES, PSK TLS"></v-text-field>
                                    </v-col>
                                  </v-row>
                                </template>
                              </v-container>
                            </v-col>
                          </v-row>
                        </v-container>

                        <v-card-actions>
                          <v-container fluid class="ma-0 pa-0">
                            <v-row no-gutters align="end" justify="end">
                              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="pa-1">
                                <v-btn v-if="okset.state == 'active'" color="primary" class="mx-1" @click="deleteKset(okset)" :disabled="disabled">
                                  <v-icon left>mdi-delete</v-icon>
                                  Delete
                                </v-btn>
                                <v-btn v-if="getOkset(okset)" color="primary" class="mx-1" @click="openReplaceKeysetDialog(okset)" :disabled="disabled">
                                  <v-icon left>mdi-pencil</v-icon>
                                  Replace
                                </v-btn>
                                <v-btn v-if="okset.state != 'active'" color="primary" class="mx-1" @click="resetKset(okset)" :disabled="disabled">
                                  <v-icon left>mdi-broom</v-icon>
                                  Reset
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card-actions>
                      </v-card>
                    </template>
                  </flo-expand>
                </v-col>
              </v-row>
            </template>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import floRfmMisc from "~/components/se/floRfmMisc.vue";
import helpers from "~/src/helpers.js";
import enums from "~/src/enums.js";
export default {
  name: "flo-ram-keys",
  components: {
    floRfmMisc,
  },
  data() {
    return {
      helpers,
      enums,
      password: false,
      card_store_hidden_filter: [],
      redraw_add_keyset: 1,
      dialog_add_keyset: false,
      add_keyset_op: null,
      dialog_replace_keyset: false,
      replace_keyset_op: null,
      last_app: "",
      scps: [
        { key: "80", value: "SCP80 - (SMS, CAT-TP)" },
        { key: "81", value: "SCP81 - (HTTPS)" },
      ],
      algo_items: [],
      loading: true,
      card_key_store: [],
      card_key_store_history: [],
      card_key_store_orginal: [],
      card_keysets_orginal: [],
      operations: [],
    };
  },
  props: {
    iccid: {
      type: String,
      required: true,
      default: "",
    },
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
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    keyset80: {
      type: Number,
      required: false,
      default: 0,
    },
    keyset81: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    get_first_op() {
      if (!this.hasOwnProperty("operations")) {
        return null;
      }

      if (this.operations.length == 0) {
        return null;
      }

      return this.operations[0];
    },
    gen_slow_unique() {
      let lnow = new Date();
      let lu = lnow.toISOString();
      return lu
        .replace(/-/g, "")
        .replace(/\:/g, "")
        .replace("T", "")
        .replace(/\.[0-9]{3}Z/, "");
    },
    gen_ref(action) {
      let lref = this.gen_slow_unique();
      return `/isd_keys/${action}/${lref}`;
    },
    card_store_to_keysets(p_card_store) {
      let l_keysets = p_card_store.reduce((pv, cv, ci, arr) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }

        let found_keyset = l_pv.find((f) => f.keyset == cv.keyset);
        let okeyid = {
          keyid: cv.keyid,
          key_type: cv.key_type,
          name: cv.name,
          alg: cv.alg,
          revision: cv.revision,
          size: cv.size,
        };

        if (!found_keyset) {
          let okvn = { scp: cv.scp, keyset: cv.keyset, state: cv.state, keys: [] };
          okvn.keys.push(okeyid);
          l_pv.push(okvn);
        } else {
          found_keyset.keys.push(okeyid);
        }

        return l_pv;
      }, []);

      return l_keysets;
    },
    getCardKeysetsMerged() {
      let l_ops = this.getRamKeysOperations();
      let l_add_ops = l_ops.filter((f) => this.isOpAddKvn(f));
      let l_replace_ops = l_ops.filter((f) => this.isOpReplaceKvn(f));
      let l_delete_ops = l_ops.filter((f) => this.isOpDeleteKvn(f));

      let l_merged = [];
      for (let i = 0; i < l_add_ops.length; i++) {
        const l_add_op = l_add_ops[i];

        let okvn = { ref: l_add_op.ref, scp: this.getOpScp(l_add_op), keyset: this.getOpNKvn(l_add_op), state: l_add_op.stype, priority: l_add_op.priority, keys: [] };
        for (let j = 0; j < l_add_op.isd_keys.data.length; j++) {
          const l_add_op_key = l_add_op.isd_keys.data[j];

          let okeyid = {
            keyid: l_add_op_key.keyid,
            key_type: l_add_op_key.type,
            name: l_add_op_key.name,
            alg: l_add_op_key.alg,
          };
          okvn.keys.push(okeyid);
        }

        l_merged.push(okvn);
      }

      let l_original = this.card_keysets_orginal;
      for (let i = 0; i < l_original.length; i++) {
        let okset = l_original[i];
        let mkset = okset;
        let lfound = l_delete_ops.find((f) => f.kvn == okset.keyset);
        if (lfound) {
          mkset = JSON.parse(JSON.stringify(okset));
          mkset.ref = lfound.ref;
          mkset.state = lfound.stype;
          mkset.priority = lfound.priority;
        } else {
          lfound = l_replace_ops.find((f) => f.kvn == okset.keyset);
          if (lfound) {
            mkset = JSON.parse(JSON.stringify(okset));
            mkset.state = lfound.stype;
            mkset.ref = lfound.ref;
            mkset.priority = lfound.priority;
            let lkeys = mkset.keys;
            for (let j = 0; j < lkeys.length; j++) {
              let okeyid = lkeys[j];
              let lkeyid_found = lfound.isd_keys.data.find((f) => f.keyid == okeyid.keyid);
              if (lkeyid_found) {
                okeyid.name = lkeyid_found.name;
              }
            }
          }
        }

        l_merged.push(mkset);
      }
      let l_sorted = l_merged.sort((a, b) => a.keyset - b.keyset);

      return l_sorted;
    },
    getOkset(okset) {
      let l_state = "";
      let l_name = [];
      let l_visible = false;

      if (okset.hasOwnProperty("state")) {
        l_state = okset.state;
      }
      if (okset.hasOwnProperty("keys")) {
        l_name = okset.keys.filter((f) => f.name == "unknown");
      }
      if (l_state == "active" && l_name.length == 0) {
        l_visible = true;
      }
      return l_visible;
    },
    async initialize() {
      console.log(`flo-ram-keys - initialize - enter`);
      console.log(`flo-ram-keys - initialize - value: ${JSON.stringify(this.value)}`);

      let le_scp_keystore_alg = enums()["scp_keystore_alg"];
      this.algo_items = le_scp_keystore_alg;

      let l_all_keysets = await this.loadKeysets();
      this.card_key_store_orginal = l_all_keysets.filter((f) => f.state != "history");
      this.card_key_store_history = l_all_keysets.filter((f) => f.state == "history");
      this.card_keysets_orginal = this.card_store_to_keysets(this.card_key_store_orginal);

      this.card_store_hidden_filter = [
        {
          k: "iccid",
          op: "equal",
          v: this.iccid,
        },
        {
          k: "state",
          op: "not_equal",
          v: "history",
        },
      ];

      if (null == this.value) {
        this.syncParent();
      } else {
        this.operations = this.value;
      }

      this.loading = false;
    },
    getAllKeysets(keyset, key_type) {
      console.log("flo-ram-keys - getAllKeysets - enter");
      let l_all_keysets = ["generate"];
      console.log(`flo-ram-keys - getAllKeysets - keyset: ${keyset}, key_type: ${key_type}`);
      let found = this.card_key_store_history.filter((f) => f.keyset == keyset && f.key_type == key_type && f.name != "unknown");

      if (found.length > 0) {
        for (let i = 0; i < found.length; i++) {
          const f = found[i];
          l_all_keysets.push(f.name);
        }
      }

      console.log(`flo-ram-keys - getAllKeysets - filtered - ${JSON.stringify(l_all_keysets)}`);

      return l_all_keysets;
    },
    getAlgoItem() {},
    setAlgoItem() {},
    getAlgoItems(alg) {
      console.log(`floRamKeys - getAlgoItems - alg: ${alg}`);
      if (this.algo_items.length > 0) {
        let l_alg = this.algo_items.find((f) => f.key == alg);
        if (l_alg) {
          return l_alg.value;
        }
      }

      return "Unknown";
    },
    syncParent() {
      console.log(`flo-ram-keys - syncParent - enter - ${JSON.stringify(this.operation)}`);
      let lops = this.operations;
      let l_sorted = lops.sort((a, b) => a.priority - b.priority);
      this.$emit("change", l_sorted);
    },
    getRamKeysOperations() {
      console.log(`flo-ram-keys - getRamKeysOperation - enter`);
      if (!this.operations) {
        return [];
      }
      return this.operations;
    },
    isOpAddKvn(p_op) {
      if (!p_op.hasOwnProperty("kvn")) {
        return false;
      }
      return p_op.kvn == 0;
    },
    isOpReplaceKvn(p_op) {
      if (!p_op.hasOwnProperty("kvn")) {
        return false;
      }

      if (p_op.isd_keys.hasOwnProperty("delkey")) {
        return false;
      }

      return p_op.kvn != 0;
    },
    isOpDeleteKvn(p_op) {
      if (!p_op.hasOwnProperty("kvn")) {
        return false;
      }

      if (!p_op.isd_keys.hasOwnProperty("delkey")) {
        return false;
      }

      return true;
    },
    getOpKey(p_op, type) {
      console.log(`flo-ram-keys - getOpKey - enter - ${type}`);
      let lop = p_op;
      if (!lop.hasOwnProperty("isd_keys")) {
        console.log(`flo-ram-keys - getOpKey - no keys`);
        return undefined;
      }
      console.log(`flo-ram-keys - getOpKey - lop: ${JSON.stringify(lop)}`);
      let lkeys = lop.isd_keys;
      console.log(`flo-ram-keys - getOpKey - lkeys: ${JSON.stringify(lkeys)}`);

      if (!lkeys.hasOwnProperty("data")) {
        console.log(`flo-ram-keys - getOpKey - no data`);
        return undefined;
      }

      let found = lkeys.data.find((f) => f.type == type);
      return found;
    },
    opHasKey(p_op, type) {
      console.log(`flo-ram-keys - opHasKey - enter - ${type}`);
      let found = this.getOpKey(p_op, type);
      console.log(`flo-ram-keys - opHasKey - found - ${JSON.stringify(found)}`);
      return found;
    },
    getOpKeyName(p_op, type) {
      console.log(`flo-ram-keys - getOpKeyName - enter - ${type}`);
      let lkey = this.getOpKey(p_op, type);
      if (!lkey) {
        console.log(`flo-ram-keys - getOpKeyName - type - ${type} - not found`);
        return "";
      }
      console.log(`flo-ram-keys - getOpKeyName - name - ${lkey.name}`);
      return lkey.name;
    },
    setOpKey(p_op, type, event) {
      console.log(`flo-ram-keys - setOpKey - p_op: ${JSON.stringify(p_op)}, type: ${type}, event: ${event}`);
      let lkey = this.getOpKey(p_op, type);
      if (!lkey) {
        return;
      }

      lkey["name"] = event;
    },
    getOpScp(p_op) {
      if (!p_op.hasOwnProperty("scp")) {
        return "80";
      }

      return p_op.scp;
    },
    getListOp() {
      return this.operations.find((f) => f.stype == "list");
    },
    hasListOp() {
      if (this.getListOp()) {
        return true;
      }

      return false;
    },
    setListOp(event) {
      if (event) {
        let lop = {
          ref: this.gen_ref("list"),
          app: this.last_app,
          type: "isd_keys",
          stype: "list",
          priority: 4,
          update: false,
          isd_keys: {},
        };

        this.operations.push(lop);
      } else {
        this.operations = this.operations.filter((f) => f.stype != "list");
      }
      this.syncParent();
    },
    getListOpUpdate() {
      let l_list_op = this.getListOp();
      if (!l_list_op) {
        return false;
      }
      return l_list_op.update;
    },
    setListOpUpdate(event) {
      let l_list_op = this.getListOp();
      if (!l_list_op) {
        return;
      }
      l_list_op.update = event;
      this.syncParent();
    },
    setAddOpScp(p_op, event) {
      if (p_op["scp"] == event) {
        return;
      }

      let _op = null;

      if ("81" == event) {
        _op = this.newAddKeyset81();
      } else {
        _op = this.newAddKeyset80();
      }

      let lop = {
        ref: this.gen_ref("add"),
        app: this.last_app,
        type: "isd_keys",
        stype: "add",
        priority: 3,
        ..._op,
      };

      this.add_keyset_op = lop;
      this.redraw_add_keyset++;

      return lop;
    },
    getAddKeysets(p_scp) {
      console.log(`flo-ram-keys - getAddKeysets - enter - p_scp:${p_scp}`);
      return this.getUnusedKeysets(p_scp);
    },
    getReplaceKeysets(p_scp) {
      console.log(`flo-ram-keys - getReplaceKeysets - enter - p_scp:${p_scp}`);
      let lunused = this.getUnusedKeysets(p_scp);
      console.log(`flo-ram-keys - getReplaceKeysets - enter - lunused:${JSON.stringify(lunused)}`);
      lunused.push({ key: this.replace_keyset_op.kvn, value: `Keyset ${this.replace_keyset_op.kvn}` });
      return lunused;
    },
    getOpNKvn(p_op) {
      console.log(`flo-ram-keys - getOpNKvn - enter`);
      if (!p_op.hasOwnProperty("isd_keys")) {
        console.log(`flo-ram-keys - getOpNKvn - no isd_keys`);
        return 0;
      }

      if (!p_op.isd_keys.hasOwnProperty("nkvn")) {
        console.log(`flo-ram-keys - getOpNKvn - no nkvn`);
        return 0;
      }
      console.log(`flo-ram-keys - getOpNKvn - nkvn: ${p_op.isd_keys.nkvn}`);
      return p_op.isd_keys.nkvn;
    },
    setOpNKvn(p_op, event) {
      if (!p_op.hasOwnProperty("isd_keys")) {
        p_op["isd_keys"] = {};
      }

      if (!p_op.isd_keys.hasOwnProperty("nkvn")) {
        p_op.isd_keys["nkvn"] = 0;
      }

      p_op.isd_keys.nkvn = event;
    },

    resetKset(event) {
      this.operations = this.operations.filter((f) => f.ref != event.ref);
      this.syncParent();
    },
    deleteKset(event) {
      console.log(`flo-ram-keys - deleteKset - enter`);
      console.log(`flo-ram-keys - deleteKset - item: ${JSON.stringify(event)}`);

      let lop = {
        ref: this.gen_ref("delete"),
        app: this.last_app,
        type: "isd_keys",
        stype: "delete",
        priority: 1,
        kvn: parseInt(event.keyset),
        scp: event.scp,
        isd_keys: { delkey: 0 },
      };

      this.operations.push(lop);
      this.syncParent();
    },
    openAddKeysetDialog() {
      let _op = this.newAddKeyset80();
      let lop = {
        ref: this.gen_ref("add"),
        app: this.last_app,
        type: "isd_keys",
        stype: "add",
        priority: 3,
        ..._op,
      };

      this.add_keyset_op = lop;
      this.dialog_add_keyset = true;
    },
    cancelAddKeysetDialog() {
      this.add_keyset_op = null;
      this.dialog_add_keyset = false;
    },
    saveAddKeysetDialog() {
      let lops = this.operations;
      lops.push(this.add_keyset_op);

      this.dialog_add_keyset = false;
      this.add_keyset_op = null;

      this.syncParent();
    },
    openReplaceKeysetDialog(event) {
      console.log(`flo-ram-keys - openReplaceKeysetDialog - enter`);
      console.log(`flo-ram-keys - openReplaceKeysetDialog - ${JSON.stringify(event)}`);

      let lkeys = event.keys.sort((a, b) => a.keyid - b.keyid);

      let lop = {
        ref: this.gen_ref("replace"),
        app: this.last_app,
        type: "isd_keys",
        stype: "replace",
        priority: 2,
        scp: event.scp,
        kvn: parseInt(event.keyset),
        keyid: lkeys[0].keyid,
        isd_keys: {
          nkvn: parseInt(event.keyset),
          data: [],
        },
      };

      for (let i = 0; i < lkeys.length; i++) {
        const okey = lkeys[i];
        let lokey = {
          keyid: okey.keyid,
          type: okey.key_type,
          alg: okey.alg,
          name: "generate",
        };

        lop.isd_keys.data.push(lokey);
      }
      console.log(`flo-ram-keys - openReplaceKeysetDialog - lop:${JSON.stringify(lop)}`);

      this.replace_keyset_op = lop;
      this.dialog_replace_keyset = true;
    },
    cancelReplaceKeysetDialog() {
      this.replace_keyset_op = null;
      this.dialog_replace_keyset = false;
    },
    saveReplaceKeysetDialog() {
      let lops = this.operations;
      lops.push(this.replace_keyset_op);

      this.dialog_replace_keyset = false;
      this.add_keyset_op = null;

      this.syncParent();
    },
    newAddKeyset80() {
      console.log(`flo-ram-keys - newKeyset80 - enter`);
      let lop = {};

      lop["kvn"] = 0;
      lop["scp"] = "80";
      lop["keyid"] = 1;
      lop["isd_keys"] = {
        nkvn: 0,
        data: [],
      };

      let lkeys = lop.isd_keys;

      let l_unused_keysets = this.getUnusedKeysets(lop.scp);
      console.log(`flo-ram-keys - newKeyset80 - l_unused_keysets - ${JSON.stringify(l_unused_keysets)}`);
      if (l_unused_keysets.length == 0) {
        return lop;
      }

      lkeys.data.push({ keyid: 1, type: "kic", alg: "88", name: "generate" });
      lkeys.data.push({ keyid: 2, type: "kid", alg: "88", name: "generate" });
      lkeys.data.push({ keyid: 3, type: "dek", alg: "88", name: "generate" });

      lop["scp"] = "80";

      lkeys.nkvn = l_unused_keysets[0].key;

      console.log(`flo-ram-keys - newKeyset80 - lop - ${JSON.stringify(lop)}`);
      return lop;
    },
    newAddKeyset81() {
      console.log(`flo-ram-keys - newKeyset81 - enter`);
      let lop = {};

      lop["kvn"] = 0;
      lop["scp"] = "81";
      lop["keyid"] = 1;
      lop["isd_keys"] = {
        nkvn: 0,
        data: [],
      };

      let lkeys = lop.isd_keys;

      let l_unused_keysets = this.getUnusedKeysets(lop.scp);
      console.log(`flo-ram-keys - newKeyset81 - l_unused_keysets - ${JSON.stringify(l_unused_keysets)}`);
      if (l_unused_keysets.length == 0) {
        return lop;
      }

      lkeys.nkvn = l_unused_keysets[0].key;

      lkeys.data.push({ keyid: 1, type: "tlspsk", alg: "85", name: "generate" });
      lkeys.data.push({ keyid: 2, type: "tlsdek", alg: "88", name: "generate" });

      console.log(`flo-ram-keys - newKeyset81 - l_unused_keysets - ${JSON.stringify(l_unused_keysets)}`);

      console.log(`flo-ram-keys - newKeyset81 - lop - ${JSON.stringify(lop)}`);
      return lop;
    },
    getUsedKeysets(p_scp) {
      console.log(`flo-ram-keys - getUsedKeysets - enter - p_scp:${p_scp}`);
      let l_card_keys = this.getCardKeysetsMerged();
      console.log(`flo-ram-keys - getUsedKeysets - enter - l_used_keysets: ${JSON.stringify(l_card_keys)}`);
      let l_used_keysets = l_card_keys.reduce((pv, cv, ci, array) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }
        let found = l_pv.find((f) => (cv.state != "active" && cv.state != "replace" && cv.state != "add") || (f.scp == cv.scp && f.keyset == cv.keyset));

        if (!found) {
          l_pv.push({ scp: cv.scp, keyset: cv.keyset });
        }

        return l_pv;
      }, []);

      let lmatch = l_used_keysets.filter((f) => f.scp == p_scp);
      let lmap = lmatch.map((m) => {
        return { key: m.keyset, value: `Keset ${m.keyset}` };
      });

      console.log(`flo-ram-keys - getUsedKeysets - final - p_scp:${p_scp}, used:${JSON.stringify(lmap)}`);

      return lmap;
    },
    getUnusedKeysets(p_scp) {
      console.log(`flo-ram-keys - getUnusedKeysets - enter - p_scp:${p_scp}`);

      let lmatch = this.getUsedKeysets(p_scp);
      console.log(`flo-ram-keys - getUnusedKeysets - p_scp:${p_scp}, l_used_keysets - ${JSON.stringify(lmatch)}`);
      let l_available_keysets = [];

      if (p_scp == "80") {
        l_available_keysets = enums()["keyset_scp80"];
      } else {
        l_available_keysets = enums()["keyset_scp81"];
      }

      let l_unused_keysets = [];
      l_unused_keysets = l_available_keysets.filter((f) => f.key != 0 && !lmatch.find((k) => k.key == f.key));
      console.log(`flo-ram-keys - getUnusedKeysets - final - p_scp:${p_scp}, unused:${JSON.stringify(l_unused_keysets)}`);

      return l_unused_keysets;
    },
    onRamKeysChange(event) {
      console.log(`flo-ram-keys - onRamKeysChange - enter - ${JSON.stringify(event)}`);
      let lops = this.operations;

      if (event) {
        const l_opi = lops.findIndex((fi) => fi.ref === event.ref);
        if (l_opi == -1) {
          return;
        }

        lops[l_opi] = event;

        this.syncParent();
      }
    },
    onMiscChange(event) {
      if (event) {
        this.last_app = event.app;
        this.operations = this.operations.map((m) => {
          m["app"] = this.last_app;
          return m;
        });
        this.syncParent();
      }
    },

    async loadKeysets() {
      const llist = {
        where: [
          {
            k: "iccid",
            op: "equal",
            v: this.iccid,
          },
        ],
      };

      let l_card_keys = await this.$axios.$post(`/api/v1/card_key_store/list`, llist);
      return l_card_keys;
    },
    getUiccAids() {
      if (!this.uicc.hasOwnProperty("aids")) {
        return null;
      }
      return this.uicc.aids;
    },
    getKeyStoreStateColor(state) {
      let lstate = state.toLowerCase();
      switch (lstate) {
        case "active":
          return "success";
        case "replace":
        case "add":
        case "pending":
          return "warning";
        case "history":
          return "disabled";
        case "delete":
          return "error";
      }
    },
  },
};
</script>
