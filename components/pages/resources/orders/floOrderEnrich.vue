<template>
  <div class="flo-order-enrich">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col class="pa-1" cols="12">
          <v-row no-gutters>
            <v-col cols="12" lg="1" xl="1" class="pa-1">
              <v-text-field v-model.number="dedicated_headers.quantity.value" :label="dedicated_headers.quantity.label" :hint="dedicated_headers.quantity.hint" :type="dedicated_headers.quantity.type" :rules="dedicated_headers.quantity.rule" @change="onDedicatedFieldChange('quantity', $event)" disabled persistent-hint outlined dense></v-text-field>
            </v-col>
          </v-row>
          <flo-expand title="Security" elevation="0">
            <template v-slot:content="{}">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <v-card :disabled="validOrderState()" flat outlined>
                      <v-card-text class="ma-0 pa-0">
                        <v-row no-gutters>
                          <div class="flex-grow-1"></div>
                          <v-col cols="12" class="pa-1" lg="1" xl="1">
                            <v-tooltip top>
                              <template v-slot:activator="{ on }">
                                <v-btn color="primary" class="ma-1" v-on="on" @click="initialize(true)">
                                  <v-icon left> mdi-refresh </v-icon>
                                  Reload
                                </v-btn>
                              </template>
                              <span>Reload Cached Resources</span>
                            </v-tooltip>
                          </v-col>
                        </v-row>
                        <v-row no-gutters>
                          <v-col cols="12" lg="2" xl="2" class="pa-1">
                            <v-autocomplete v-model="dedicated_headers.hsm_id.value" :label="dedicated_headers.hsm_id.label" :hint="dedicated_headers.hsm_id.hint" :items="dedicated_headers.hsm_id.items" item-text="value" item-value="key" @change="onDedicatedFieldChange('hsm_id', $event)" dense persistent-hint outlined></v-autocomplete>
                          </v-col>

                          <v-col v-if="hasHsm()" cols="12" lg="2" xl="2" class="pa-1">
                            <v-select v-model="dedicated_headers.ota_wrap_mode.value" :label="dedicated_headers.ota_wrap_mode.label" :hint="dedicated_headers.ota_wrap_mode.hint" :items="dedicated_headers.ota_wrap_mode.items" :rules="dedicated_headers.ota_wrap_mode.rule" item-text="value" item-value="key" @change="onDedicatedFieldChange('ota_wrap_mode', $event)" no-data-text="Please select Encryption" dense persistent-hint outlined></v-select>
                          </v-col>

                          <v-col v-if="isEncrypted()" cols="12" lg="2" xl="2" class="pa-1">
                            <v-autocomplete :loading="loading_keys" v-model="dedicated_headers.tk_ota_id.value" :label="dedicated_headers.tk_ota_id.label" :hint="dedicated_headers.tk_ota_id.hint" :items="tks" :rules="dedicated_headers.tk_ota_id.rule" item-text="value" item-value="key" @change="onDedicatedFieldChange('tk_ota_id', $event)" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                          </v-col>
                          <v-col v-if="isEncrypted()" cols="12" lg="2" xl="2" class="pa-1">
                            <v-autocomplete :loading="loading_keys" v-model="dedicated_headers.tk_net_id.value" :label="dedicated_headers.tk_net_id.label" :hint="dedicated_headers.tk_net_id.hint" :items="tks" :rules="dedicated_headers.tk_net_id.rule" item-text="value" item-value="key" @change="onDedicatedFieldChange('tk_net_id', $event)" no-data-text="Please select valid HSM" dense clearable persistent-hint outlined></v-autocomplete>
                          </v-col>
                        </v-row>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </flo-expand>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col class="pa-1" cols="12">
          <flo-expand :open="open_headers" :key="open_headers_key" title="Headers" elevation="0">
            <template v-slot:content="{}">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <v-card flat>
                      <v-card-text class="ma-0 pa-0">
                        <v-row no-gutters>
                          <div class="flex-grow-1"></div>
                        </v-row>

                        <v-row v-if="getUnknownProductHeaders().length > 0" no-gutters>
                          <v-col cols="12" class="ma-1 pa-1">
                            <p class="text-subtitle-2 font-weight-bold ma-1 pa-1 error--text mx-1">
                              Unknown Headers
                              <v-btn x-small color="error" @click="preDelete(null, 'header')">Remove All</v-btn>
                            </p>
                            <v-chip-group show-arrows column>
                              <v-chip v-for="(uh, idx) in getUnknownProductHeaders()" :key="idx" small outlined color="error" close @click="editHeader(uh)" @click:close="preDelete(uh, 'header')">
                                <span class="wrapclass"> {{ uh.name }} - {{ uh.value }} </span>
                              </v-chip>
                            </v-chip-group>
                          </v-col>
                        </v-row>

                        <v-form v-model="valid_headers">
                          <v-row no-gutters>
                            <v-col v-for="(product_header, idx) in getProductHeaders()" :key="idx" cols="12" lg="3" xl="3" class="pa-1">
                              <flo-parser-view v-if="product_header.pattern.includes('parse') && uicc" :value="getHeaderValue(product_header)" :row="product_header" :header="product_header" :required_mask="uicc.required_mask" :available_mask="uicc.available_mask" :disabled="validOrderState() || getFieldHeaderDisabled(product_header)" @input="onHeaderChanged(product_header, $event)" />
                              <flo-meta-field-edit v-else :disabled="validOrderState() || getFieldHeaderDisabled(product_header)" :header="getFieldHeaderFromProductHeader(product_header)" :value="getHeaderValue(product_header)" :pattern="getFieldHeaderPatternFromProductHeader(product_header)" @change="onHeaderChanged(product_header, $event)"> </flo-meta-field-edit>
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </flo-expand>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col class="pa-1" cols="12">
          <flo-expand :open="open_inputs" :key="open_inputs_key" title="Inputs" elevation="0">
            <template v-slot:content="{}">
              <v-container fluid class="ma-0 pa-0">
                <v-row no-gutters>
                  <v-col cols="12" class="pa-1">
                    <v-card flat>
                      <v-card-text class="ma-0 pa-0">
                        <v-row no-gutters>
                          <div class="flex-grow-1"></div>
                        </v-row>

                        <v-row v-if="getUnknownProductInputs().length > 0" no-gutters>
                          <v-col cols="12" class="ma-1 pa-1">
                            <p class="text-subtitle-2 font-weight-bold ma-1 pa-1 error--text mx-1">
                              Unknown Inputs
                              <v-btn x-small color="error" @click="preDelete(null, 'input')">Remove All</v-btn>
                            </p>
                            <v-chip-group show-arrows column>
                              <v-chip v-for="(ui, idx) in getUnknownProductInputs()" :key="idx" small outlined color="error" close @click="editInput(ui)" @click:close="preDelete(ui, 'input')">
                                <span class="wrapclass"> {{ ui.name }} - {{ ui.value }} </span>
                              </v-chip>
                            </v-chip-group>
                          </v-col>
                        </v-row>

                        <v-form v-model="valid_inputs">
                          <v-row no-gutters>
                            <v-col v-for="(product_input, idx) in getProductInputs()" :key="idx" cols="12" lg="3" xl="3" class="pa-1">
                              <flo-meta-field-edit :disabled="validOrderState() || getFieldInputDisabled(product_input)" :pattern="getFieldHeaderPatternFromProductInput(product_input)" :header="getFieldHeaderFromProductInput(product_input)" :value="getInputValue(product_input)" @input="onInputChanged(product_input, $event)"> </flo-meta-field-edit>
                            </v-col>
                          </v-row>
                        </v-form>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
              </v-container>
            </template>
          </flo-expand>
        </v-col>
      </v-row>

      <v-row v-if="hideSubs" no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-expand title="Subscribers" elevation="0" :open="subs_expand_open" :key="open_subs_key" @expand="onSubsExpand()">
            <template v-slot:content="{}">
              <p v-if="blankSub()" class="mt-n2 ml-5 mb-0 body-1 info--text">*Subscriber is already enriched.</p>
              <v-row no-gutters v-if="subs.length > 1">
                <v-col cols="12" :lg="`${selected_subs.length > 4 ? 6 : 3}`" :xl="`${selected_subs.length > 4 ? 6 : 3}`" class="ma-1 pa-1">
                  <v-select v-model="selected_subs" :items="Object.values(subs)" :disabled="validOrderState() || blankOrder()" label="Edit Subscribers" item-value="idx" item-text="label" :menu-props="{ offsetY: true }" hint="Select Subscribers" height="45" chips dense outlined persistent-hint multiple></v-select>
                </v-col>
              </v-row>

              <template v-for="(sub, i) in subs">
                <v-row no-gutters :key="i" v-if="selected_subs.includes(sub.idx)">
                  <v-col cols="12" class="pa-1">
                    <flo-expand :title="`Subscriber ${sub.idx}`" :open="sub.used ? true : false" elevation="0">
                      <template v-slot:content="{}">
                        <v-card :disabled="validOrderState() || blankOrder()" flat>
                          <v-card-text class="ma-0 pa-0">
                            <flo-order-enrich-subscriber :has_hsm="hasHsm()" :order_inputs="getOrderInputs()" :bindings="bindings" :value="sub" :op="op" :ki="ki" :opc="opc" :subs="subs" :product="product" :type="order.type" :subs_differences="subs_differences"></flo-order-enrich-subscriber>
                          </v-card-text>
                        </v-card>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>
              </template>
            </template>
          </flo-expand>
        </v-col>
      </v-row>

      <v-row v-if="hideCardKeys" no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-expand title="Card Keys" elevation="0">
            <template v-slot:content="{}">
              <p v-if="blankCardKeys() || localCardKeys()" class="mt-n2 ml-5 mb-0 body-1 info--text">*Card Keys are already populated.</p>
              <v-card :disabled="validOrderState()" flat>
                <v-card-text class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="2" xl="2" class="ma-1 pa-1">
                      <v-switch v-model="card_keys" @change="switchAllCardKeys(card.keys)" :disabled="blankOrder() || localFactoryOrder()" label="Switch All" hint="Switch All Card Keys" color="success" inset persistent-hint outlined></v-switch>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col v-for="(key, i) in Object.values(card.keys)" cols="12" lg="2" xl="2" class="ma-1 pa-1" :key="i">
                      <v-switch v-model="key.value" :label="key.label" :messages="formatKeyWarnings(card.keys, i)" :disabled="blankOrder() || localFactoryOrder()" color="success" inset persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span class="clear-hint" v-html="message"></span>
                        </template>
                      </v-switch>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </template>
          </flo-expand>
        </v-col>
      </v-row>

      <v-row v-if="hidePersonalKeys" no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-expand title="Personalization Keys" elevation="0" @expand="onPersonalExpand()" :open="personal_expand_open" :key="open_personal_key">
            <template v-slot:content="{}">
              <p v-if="hasPersonalizationKeys()" class="mt-n2 ml-5 mb-0 body-1 info--text">*Personalization Keys are already populated.</p>
              <p v-if="disable_personal" class="mt-n2 ml-5 mb-0 body-1 info--text">*Editing is disabled on Product level.</p>
              <v-card :disabled="validOrderState()" flat>
                <v-card-text class="ma-0 pa-0">
                  <v-row no-gutters>
                    <v-col cols="12" lg="2" xl="2" class="ma-1 pa-1">
                      <v-switch v-model="personalization_keys" @change="switchAllPersonalizationKeys()" :disabled="disable_personal || localFactoryOrder() || blankOrder()" label="Switch All" hint="Switch All Personalization Keys" color="success" inset persistent-hint outlined></v-switch>
                    </v-col>
                  </v-row>
                  <v-row no-gutters>
                    <v-col v-for="(p, i) in Object.values(personal)" class="ma-1 pa-1" cols="12" lg="2" xl="2" :key="i">
                      <v-switch v-model="p.value" :label="`Drive ${p.label}`" :messages="formatKeyWarnings(personal, i)" :disabled="disable_personal || localFactoryOrder() || blankOrder()" class="my-5" color="success" inset persistent-hint outlined>
                        <template v-slot:message="{ message }">
                          <span class="clear-hint" v-html="message"></span>
                        </template>
                      </v-switch>
                      <v-switch v-if="p.value" v-model="p.random" :label="`Random ${p.label}`" :hint="`Randomize ${p.hint}`" :disabled="disable_personal || localFactoryOrder() || blankOrder()" class="my-5" color="success" inset persistent-hint outlined></v-switch>
                      <v-switch v-if="p.value && p.random == true && p.label == 'ADM'" v-model="p.digits_only" :disabled="disable_personal || localFactoryOrder() || blankOrder()" label="Digits Only" hint="Randomize Digits Only Administrator Key" class="my-5" color="success" inset persistent-hint outlined></v-switch>
                      <v-text-field v-if="!p.random && p.value" v-model="p.fixed" :label="`Fixed ${p.label}`" :hint="`Fixed ${p.hint}`" :rules="[p.rule]" :disabled="disable_personal || localFactoryOrder() || blankOrder()" class="my-5" dense persistent-hint outlined></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </template>
          </flo-expand>
        </v-col>
      </v-row>
      <v-row v-if="review" no-gutters>
        <v-col cols="12" class="pa-1">
          <flo-json-editor name="Enrich" mode="view" :modes="['view', 'preview', 'text']" :value="output" :key="out_version"></flo-json-editor>
        </v-col>
      </v-row>
      <v-row no-gutters>
        <v-col cols="12" class="my-1 pa-1">
          <v-btn v-if="!validOrderState()" :disabled="canEnrich() || stillLoading()" color="primary" @click="onEnrich()">
            <v-icon left>mdi-file-chart</v-icon>
            Enrich Sample
          </v-btn>
          <v-btn v-if="review" :disabled="canEnrich() || stillLoading()" :loading="stillLoading()" color="primary" @click="onAccept()">
            <v-icon left>mdi-content-save</v-icon>
            Accept
          </v-btn>
          <v-btn v-if="review" :disabled="canEnrich() || stillLoading()" color="primary" @click="onReject()">
            <v-icon left>mdi-cancel</v-icon>
            Cancel
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog :overlay-opacity="0.4" v-model="displayEdit" width="auto ">
      <v-card>
        <v-card-title>Edit {{ displayEditInfo.type == "input" ? "Input" : "Header" }} "{{ displayEditInfo.orig.name }}".</v-card-title>
        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col class="pa-1">
                <v-text-field v-model="displayEditInfo.change.name" label="Name" :hint="`Original Name: ${displayEditInfo.orig.name}.`"></v-text-field>
              </v-col>
            </v-row>
            <v-row no-gutters>
              <v-col class="pa-1">
                <v-text-field v-model="displayEditInfo.change.value" label="Value" :hint="`Original Value: ${displayEditInfo.orig.value}.`"></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="displayEdit = false">Cancel</v-btn>
          <v-btn color="primary" text @click="updateInputOrHeader()">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :overlay-opacity="0.4" v-model="deleteDialog" width="auto ">
      <v-card>
        <v-card-title>{{ dialogTitle(itemForDeletion) }}</v-card-title>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="setDelete()">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import floOrderEnrichSubscriber from "~/components/pages/resources/orders/floOrderEnrichSubscriber";
import floMetaFieldEdit from "~/components/crud/floMetaFieldEdit.vue";
import floParserView from "~/components/widgets/floParserView.vue";
import parseNetError from "~/mixins/parseNetError.js";
import { mapGetters, mapActions } from "vuex";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  name: "flo-order-enrich",
  components: {
    floOrderEnrichSubscriber,
    floMetaFieldEdit,
    floParserView,
  },
  data() {
    return {
      helpers,
      deleteDialog: false,
      itemForDeletion: {
        type: "",
        data: {},
      },
      displayEdit: false,
      displayEditInfo: {
        type: "input",
        orig: { name: "", value: "" },
        change: { name: "", value: "" },
      },
      dedicated_headers: {
        hsm_id: {
          label: "HSM",
          hint: "Hardware Security Module",
          items: [],
          value: false,
        },
        ota_wrap_mode: {
          label: "Encryption Mode",
          hint: "Keys Encryption Mode",
          items: [
            { key: "wrapped", value: "Wrapped" },
            // { key: "encrypted", value: "Encrypted" },
            { key: "raw", value: "Raw" },
          ],
          value: "wrapped",
        },
        tk_ota_id: {
          label: "TK OTA",
          hint: "Transport Key OTA",
          value: false,
        },
        tk_net_id: {
          label: "TK NET",
          hint: "Transport Key NET",
          value: false,
        },
        op_net_id: {
          label: "OP",
          hint: "Operator Key",
          items: [],
          value: false,
        },
        quantity: {
          label: "Quantity",
          hint: "Quantity Of Cards",
          value: "",
          type: "number",
          rule: [(v) => (/^[1-9]+[0-9]*$/.test(v) && v <= 50000 && !!v) || "Field is required and accepts only numbers up to 50 000."],
        },
      },
      bindings: {
        apn: {
          label: "APN",
          hint: "Access Point Name",
          items: [],
        },
        hlr: {
          label: "HLR",
          hint: "Home Location Registrar",
          items: [],
        },
        smsc: {
          label: "SMSC",
          hint: "Short Message Service Center",
          items: [],
        },
        bip: {
          label: "BIP",
          hint: "Bearer Independent Protocol",
          items: [],
        },
        billing: {
          label: "Billing",
          hint: "Billing",
          items: [],
        },
        create_sub: {
          label: "Create Subscriber",
          hint: "Create New Subscriber",
          value: false,
        },
      },
      card: {
        keys: {
          kic: {
            label: "Drive KIC",
            hint: "Key & Algorithm Identifier For Ciphering",
            value: false,
          },
          kid: {
            label: "Drive KID",
            hint: "Key & Algorithm Identifier For RC/CC/DS",
            value: false,
          },
          dek: {
            label: "Drive DEK",
            hint: "Data Encryption Key",
            value: false,
          },
          tlspsk: {
            label: "Drive TLSPSK",
            hint: "Transport Layer Security Pre-Shared Key Ciphersuites",
            value: false,
          },
          tlsdek: {
            label: "Drive TLSDEK",
            hint: "Transport Layer Security Data Encryption Key",
            value: false,
          },
        },
        security: {
          encrypt: {
            label: "Encrypt",
            hint: "Encrypt Card Keys",
            value: false,
          },
          wrap: {
            label: "Wrap",
            hint: "Wrap Card Keys",
            value: false,
          },
          tk: {
            label: "Transport Key",
            hint: "Select Transport Key",
            value: 0,
          },
        },
      },
      personal: {
        adm: {
          label: "ADM",
          hint: "Administrator",
          value: false,
          random: true,
          digits_only: false,
          fixed: "",
          rule: (v) => !!v || "ADM is required.",
        },
        pin1: {
          label: "PIN1",
          hint: "Personal Identification Number 1",
          value: false,
          random: true,
          fixed: "",
          rule: (v) => {
            const pattern = /^[0-9]{4,8}$/;
            return pattern.test(v) || "Invalid PIN format.";
          },
        },
        puk1: {
          label: "PUK1",
          hint: "Personal Unblocking Key 1",
          value: false,
          random: true,
          fixed: "",
          rule: (v) => {
            const pattern = /^[0-9]{4,8}$/;
            return pattern.test(v) || "Invalid PUK format.";
          },
        },
        pin2: {
          label: "PIN2",
          hint: "Personal Identification Number 2",
          value: false,
          random: true,
          fixed: "",
          rule: (v) => {
            const pattern = /^[0-9]{4,8}$/;
            return pattern.test(v) || "Invalid PIN format.";
          },
        },
        puk2: {
          label: "PUK2",
          hint: "Personal Unblocking Key 2",
          value: false,
          random: true,
          fixed: "",
          rule: (v) => {
            const pattern = /^[0-9]{4,8}$/;
            return pattern.test(v) || "Invalid PUK format.";
          },
        },
      },
      network: {
        ki: {
          label: "Drive KI",
          hint: "Individual Subscriber Authentication Key",
          value: false,
        },
        opc: {
          label: "Drive OPC",
          hint: "Originating Point Code",
          value: false,
        },
        encrypt: {
          label: "Encrypt",
          hint: "Encrypt Network Keys",
          value: false,
        },
        wrap: {
          label: "Wrap",
          hint: "Wrap Network Keys",
          value: false,
        },
        security: {
          op: {
            label: "Operator Key",
            hint: "Select Operator Key",
            value: null,
          },
          tk: {
            label: "Transport Key",
            hint: "Select Transport Key",
            value: null,
          },
        },
      },
      ki: [],
      opc: [],
      tks: [],
      op: [],
      subs: [],
      selected_subs: [],
      order_headers: [],
      order_inputs: [],
      review: false,
      hideSubs: true,
      hideCardKeys: true,
      subs_expand_open: false,
      hidePersonalKeys: true,
      out_version: 1,
      loading_keys: true,
      valid_headers: true,
      valid_inputs: true,
      invalid_enrich: false,
      card_keys: false,
      open_inputs: false,
      open_headers: false,
      open_inputs_key: false,
      open_subs_key: 0,
      open_headers_key: false,
      personal_expand_open: false,
      open_personal_key: 0,
      subs_differences: [],
      personalization_keys: false,
      disable_personal: false,
    };
  },
  props: {
    max_subs: {
      type: Number,
      required: false,
      default: 1,
    },
    output: {
      type: Object,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
    },
    enrich_sample: {
      type: Boolean,
      required: false,
      default: false,
    },
    has_applet: {
      type: Boolean,
      required: false,
      default: false,
    },
    product: {
      type: Object,
      required: false,
    },
    uicc: {
      type: Object,
      required: false,
    },
    order: {
      type: Object,
      required: true,
    },
  },
  mounted() {
    this.review = this.enrich_sample;
  },
  watch: {
    enrich_sample: function () {
      this.review = this.enrich_sample;
    },
  },
  computed: {
    ...mapGetters({
      getResourceKey: "session/getResourceKey",
      permissions: "session/permissions",
    }),
  },
  async created() {
    await this.initialize(true);
  },
  mixins: [tellUser, parseNetError],
  methods: {
    ...mapActions({
      addToResourceCache: "session/addToResourceCache",
    }),
    stillLoading() {
      if (this.loading) {
        return true;
      }
      return false;
    },
    switchAllCardKeys() {
      let l_card_keys = Object.values(this.card.keys);

      for (let i = 0; i < l_card_keys.length; i++) {
        const l_key = l_card_keys[i];
        l_key.value = this.card_keys;
      }
    },
    switchAllPersonalizationKeys() {
      let l_personalization_keys = Object.values(this.personal);

      for (let i = 0; i < l_personalization_keys.length; i++) {
        const l_key = l_personalization_keys[i];
        l_key.value = this.personalization_keys;
      }
    },
    onEnrich() {
      this.$emit("change", this.genEnrichPayload());
    },
    onAccept() {
      this.$emit("accept", this.genEnrichPayload());
    },
    onReject() {
      this.$emit("reject", this.genEnrichPayload());
    },
    canEnrich() {
      let l_invalid = false;
      let invalid_security = false;
      let invalid_data = false;

      if (this.dedicated_headers.ota_wrap_mode.value != "raw") {
        this.dedicated_headers.tk_ota_id.value && this.dedicated_headers.tk_ota_id.value != false ? (invalid_security = false) : (invalid_security = true);
      } else {
        invalid_security = false;
      }

      invalid_data = this.valid_inputs && this.valid_headers ? false : true;

      l_invalid = invalid_security || invalid_data ? true : false;

      this.invalid_enrich = l_invalid;
      l_invalid = this._canEnrich();

      return l_invalid;
    },
    _canEnrich() {
      let l_invalid = this.invalid_enrich;
      let l_unknown_inputs = this.getUnknownProductInputs();
      let l_unknown_headers = this.getUnknownProductHeaders();

      if (l_unknown_inputs.length > 0) {
        l_invalid = true;
        this.open_inputs = true;
        this.open_inputs_key = true;
      }

      if (l_unknown_headers.length > 0) {
        l_invalid = true;
        this.open_headers = true;
        this.open_headers_key = true;
      }

      this.$emit("invalid", l_invalid);

      return l_invalid;
    },
    validOrderState() {
      let lvalid = false;

      if (this.order.state != "manufacturing") {
        lvalid = true;
      }

      return lvalid;
    },
    async initialize(reload) {
      this.hideSections();
      let l_res = ["billings", "registrars"];

      await Promise.all([
        this.mapProductHeadersAndInputs(),
        this.loadApns(),
        this.loadHsms(reload),
        this.loadSmscs(reload),
        this.loadBips(reload),
        ...this.permissions
          .filter((p) => l_res.includes(p.res) && p.r)
          .map(async (p) => {
            if (p && p.hasOwnProperty("res")) {
              if (p.res == "registrars") {
                await this.loadHlrs(reload);
              }
              if (p.res == "billings") {
                await this.loadBillings(reload);
              }
            }
          }),
      ]);

      this.getCardSubsStructure();
      if (this.blankOrder()) {
        this.mapBlankData();
      }
      if (this.localFactoryOrder() && this.product.type == "blank") {
        this.onSubsExpand();
        this.open_subs_key++;
      }
    },
    getFieldHeaderDisabled(product_header) {
      if (product_header.origin == "user") {
        return false;
      }
      return true;
    },
    getFieldInputDisabled(product_input) {
      if (this.order.reservation_id) {
        return true;
      } else if (product_input.origin == "user") {
        return false;
      }

      return true;
    },
    getFieldHeaderFromProductHeader(product_header) {
      product_header["text"] = product_header.desc;

      return product_header;
    },
    getFieldHeaderPatternFromProductHeader(product_header) {
      if (product_header.hasOwnProperty("desc")) {
        if (product_header.desc.includes("Timeout")) {
          return ".*$";
        }
      }

      if (product_header.hasOwnProperty("pattern")) {
        return product_header.pattern;
      }
      return ".*$";
    },
    getFieldHeaderFromProductInput(product_input) {
      product_input["text"] = product_input.desc;
      product_input["message"] = this.formatInputWarnings(product_input);
      return product_input;
    },
    getFieldHeaderPatternFromProductInput(product_input) {
      if (product_input.hasOwnProperty("pattern")) {
        return product_input.pattern;
      }
      return ".*$";
    },
    getHeaderValue(product_header) {
      let l_found = this.order_headers.find((f) => f.name == product_header.name);
      if (l_found) {
        return this.formatHeaderValues(product_header.name, l_found.value);
      } else {
        return this.formatHeaderValues(product_header.name, product_header.default);
      }
    },
    getInputValue(p_input) {
      let l_found = this.order_inputs.find((f) => f.name == p_input.key || f.name == p_input.name);
      if (l_found) {
        return l_found.value;
      }

      return p_input.default;
    },
    getProductExtra() {
      if (!this.product.hasOwnProperty("extra")) {
        return null;
      }

      return this.product.extra;
    },
    getUnknownProductHeaders() {
      let l_products_headers = this.getProductHeaders();
      let l_order_headers = this.order_headers;

      let l_unknowns = [];
      let found = null;
      for (let ohi = 0; ohi < l_order_headers.length; ohi++) {
        const ohio = l_order_headers[ohi];
        found = l_products_headers.find((f) => f.name == ohio.name);
        if (!found) {
          l_unknowns.push(ohio);
        }
      }

      return l_unknowns;
    },
    getUnknownProductInputs() {
      let l_products_inputs = this.getProductInputs();
      let l_order_inputs = this.order_inputs;

      let l_unknowns = [];
      let found = null;
      for (let oii = 0; oii < l_order_inputs.length; oii++) {
        const oiio = l_order_inputs[oii];
        found = l_products_inputs.find((f) => f.name == oiio.name);
        if (!found) {
          l_unknowns.push(oiio);
        }
      }

      return l_unknowns;
    },
    getProductHeaders() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("headers")) {
        return [];
      }
      let l_headers = l_data.headers;

      return l_headers;
    },
    getProductInputs() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("inputs")) {
        return [];
      }

      let l_inputs = l_data.inputs;

      return l_inputs;
    },
    getProductPersonalizationKeys() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("personalization_keys")) {
        return [];
      }

      let l_personalization_keys = l_data.personalization_keys;

      return l_personalization_keys;
    },
    getProductSubscribers() {
      let l_extra = this.getProductExtra();
      if (!l_extra) {
        return [];
      }

      if (!l_extra.hasOwnProperty("data")) {
        return [];
      }

      let l_data = l_extra.data;

      if (!l_data.hasOwnProperty("subscribers")) {
        return [];
      }

      let l_subscribers = l_data.subscribers;

      return l_subscribers;
    },
    getOrderInputs() {
      return this.order_inputs;
    },
    getOrderOutput() {
      if (!this.output.hasOwnProperty("data")) {
        return [];
      }

      if (!this.output.data.hasOwnProperty("outputs")) {
        return [];
      }

      if (this.output.data.outputs.length == 0) {
        return [];
      }

      let { iccid, eid, subs, ...rest } = this.output.data.outputs[0];
      return rest;
    },
    getCardSubsStructure() {
      let lfirst_card_subs_copy = [];
      this.subs = [];

      if (!this.output.hasOwnProperty("data")) {
        return this.subs;
      }

      if (!this.output.data.hasOwnProperty("outputs")) {
        return this.subs;
      }

      if (this.output.data.outputs.length == 0) {
        return this.subs;
      }

      let lcard = this.output.data.outputs[0];
      if (!lcard.hasOwnProperty("subs")) {
        return this.subs;
      }
      lfirst_card_subs_copy = JSON.parse(JSON.stringify(lcard.subs));
      this.subs = lfirst_card_subs_copy.map((sub) => ({
        label: `Sub: ${sub.idx}`,
        ...sub,
      }));
      if (this.subs.length == 1) {
        this.selected_subs = [1];
      }
      return this.subs;
    },
    onSubsExpand() {
      this.subs_expand_open = true;
      if (this.subs.length > 1) {
        this.selected_subs = [];
        this.subs.forEach((sub) => {
          if (sub.used == 1) {
            this.selected_subs.push(sub.idx);
          }
        });
      }
      let l_products_headers = this.getProductHeaders();
      let sub = this.subs[0];
      let single_sub = l_products_headers.find((f) => f.name == "single" && f.default == 1);
      if (single_sub) {
        sub.used = 1;
      }

      let created_sub = l_products_headers.find((f) => f.name == "create_sub" && f.default == 1);
      if (created_sub) {
        sub.create_sub = 1;
      }
      this.output.data.inputs.forEach((inp) => {
        if (inp.name.toLowerCase().includes("imsi")) {
          let imsi_idx = +inp.name.toLowerCase().split("imsi").pop();
          if (!isNaN(imsi_idx) && !this.selected_subs.includes(imsi_idx) && inp.value != "") {
            this.selected_subs.push(imsi_idx);
            this.selected_subs.sort((a, b) => a - b);
          }
        }
      });
      this.mapSubscribersData();
    },
    onPersonalExpand() {
      this.mapPersonalizationData();
    },
    blankOrder() {
      return this.order.type == "blank" ? true : false;
    },
    blankSub() {
      if (!this.blankOrder()) return false;
      let { enet_ki: ki, enet_opc: opc } = this.subs[0] || {};
      return ki && opc;
    },
    blankCardKeys() {
      if (!this.blankOrder()) return false;
      let { eota_kic: kic, eota_kid: kid } = this.getOrderOutput() || {};
      return kic && kid;
    },
    localFactoryOrder() {
      return this.order.type == "local_factory" ? true : false;
    },
    localCardKeys() {
      if (!this.localFactoryOrder()) return false;
      let { eota_kic: kic, eota_kid: kid } = this.getOrderOutput() || {};
      return kic && kid;
    },
    hasPersonalizationKeys() {
      if (!this.blankOrder() && !this.localFactoryOrder()) return false;
      let { pin1, puk1 } = this.getOrderOutput() || {};
      return pin1 && puk1;
    },
    mapBlankData() {
      let blankSub = { ...this.subs[0] };
      if (blankSub.imsi == "") {
        let data = {
          id: this.order.id,
          sample: 20,
          headers: this.order_headers,
          inputs: this.order_inputs,
          subs: [],
          card: {
            kic: true,
            kid: true,
            dek: true,
            tlspsk: true,
            tlsdek: true,
          },
          personal: {
            adm: {
              mode: "random",
              digits_only: false,
            },
            pin1: {
              mode: "random",
            },
            puk1: {
              mode: "random",
            },
            pin2: {
              mode: "random",
            },
            puk2: {
              mode: "random",
            },
          },
        };

        blankSub.imsi = "100000000000000";
        blankSub.mcc = blankSub.mcc == "" ? blankSub.mcc : blankSub.mcc.join(",");
        blankSub["network_keys"] = "fixed_ki_opc";
        blankSub.ki = "00000000000000000000000000000000";
        blankSub.opc = "00000000000000000000000000000000";
        blankSub.create_sub = 1;
        blankSub.msisdn = "100000000000000";
        blankSub.edit_msisdn = "drive";
        blankSub.edit_imsi = "drive";
        data.subs.push(blankSub);
        this.$emit("enrich_blank", data);
      }
    },
    mapSubscribersData() {
      this.subs.forEach((sub) => {
        if (this.selected_subs.includes(sub.idx)) {
          sub.used = 1;
        }
        let match = this.getProductSubscribers().find((f) => f.idx == sub.idx);
        let enriched = this.genEnrichPayload().subs.find((f) => f.name != "" && f.idx == sub.idx);
        let single = this.getProductHeaders().find((f) => f.name == "single" && f.default == 1);

        if (single) {
          if (enriched) {
            enriched = { ...enriched, ...match };
          } else {
            enriched = this.genEnrichPayload().subs.find((f) => f.idx == sub.idx);
          }
        }

        if (this.order.type == "local_factory" && this.product.type != "blank") {
          if (enriched) {
            if (enriched.name == "Blank") {
              enriched = { ...enriched, ...match };
            }
          }
        }
        if (match && enriched) {
          let keys = ["name", "mcc", "plmn", "fplmn", "ehplmn", "apn", "bip_id", "hlr_id", "smsc_id", "billing_id", "key_id"];
          let differences = {};
          keys.forEach((key) => {
            if (match[key] && enriched[key]) {
              if (match[key].toString() != enriched[key].toString()) {
                differences[key] = {
                  original: match[key],
                  updated: enriched[key],
                };
              }
            } else {
              differences[key] = {
                original: match[key] ?? null,
                updated: null,
              };
            }
          });
          this.subs_differences.push({ idx: enriched.idx, ...differences });
        }

        if (enriched) {
          Object.assign(sub, enriched);
        } else if (match) {
          Object.assign(sub, match);
        }
      });
    },
    mapPersonalizationData() {
      let personal = this.personal;
      let product_keys = this.getProductPersonalizationKeys();
      if (product_keys) {
        this.disable_personal = product_keys.disable_personal;
        for (let key in product_keys) {
          if (personal[key]) {
            if (personal[key].hasOwnProperty("digits_only")) {
              personal[key].digits_only = product_keys[key].digits_only;
            }

            if (product_keys[key].type == "random") {
              personal[key].random = true;
              personal[key].fixed = "";
            } else {
              personal[key].random = false;
              personal[key].fixed = product_keys[key].fixed;
            }
          }
        }
      }
    },
    async mapProductHeadersAndInputs() {
      this.order_headers = this.output.data.headers;
      let l_order_headers = this.order_headers;
      this.order_inputs = this.output.data.inputs;
      let l_dedicated_headers = this.dedicated_headers;

      let l_dedicated_keys = Object.keys(l_dedicated_headers);
      let found = null;
      for (let i = 0; i < l_dedicated_keys.length; i++) {
        let l_dedicated_header_key = l_dedicated_keys[i];
        found = l_order_headers.find((f) => f.name == l_dedicated_header_key);
        if (found) {
          l_dedicated_headers[l_dedicated_header_key].value = found.value;
          if (found.name == "hsm_id") {
            await this.loadHsmKeys(found.value);
          }
        }
      }
    },
    hideSections() {
      for (const header of Object.values(this.output.data.headers)) {
        if (header.name == "enrich_hide_subs" && header.value == 1) {
          this.hideSubs = false;
        }
        if (header.name == "enrich_hide_card_keys" && header.value == 1) {
          this.hideCardKeys = false;
        }
        if (header.name == "enrich_hide_perso_keys" && header.value == 1) {
          this.hidePersonalKeys = false;
        }
      }
    },
    hasHsm() {
      if (this.dedicated_headers.hsm_id.value) {
        return true;
      }
      return false;
    },
    isEncrypted() {
      if (!this.hasHsm()) {
        return false;
      }

      if (this.dedicated_headers.ota_wrap_mode.value == "wrapped" || this.dedicated_headers.ota_wrap_mode.value == "encrypted") {
        return true;
      }

      return false;
    },
    genEnrichPayload() {
      let data = {};
      let card = {};
      let personal = {};
      let subs = this.subs.filter((s) => this.selected_subs.indexOf(s.idx) != -1);

      let l_order_headers = this.order_headers;
      let found = null;
      found = l_order_headers.find((f) => "quantity" == f.name);
      if (found) {
        found.value = +this.dedicated_headers.quantity.value;
      } else {
        l_order_headers.push({ name: "quantity", value: this.dedicated_headers.quantity.value });
      }

      if (this.hasHsm()) {
        if (this.dedicated_headers.hsm_id.value) {
          let lval = parseInt(this.dedicated_headers.hsm_id.value);
          found = l_order_headers.find((f) => "hsm_id" == f.name);
          if (found) {
            found.value = lval;
          } else {
            l_order_headers.push({ name: "hsm_id", value: lval });
          }
        }
      }

      if (this.isEncrypted()) {
        found = l_order_headers.find((f) => "ota_wrap_mode" == f.name);
        if (found) {
          found.value = this.dedicated_headers.ota_wrap_mode.value;
        } else {
          l_order_headers.push({ name: "ota_wrap_mode", value: this.dedicated_headers.ota_wrap_mode.value });
        }

        found = l_order_headers.find((f) => "tk_ota_id" == f.name);
        if (found) {
          found.value = +this.dedicated_headers.tk_ota_id.value;
        } else {
          l_order_headers.push({ name: "tk_ota_id", value: +this.dedicated_headers.tk_ota_id.value });
        }

        found = l_order_headers.find((f) => "tk_net_id" == f.name);
        if (found) {
          found.value = +this.dedicated_headers.tk_net_id.value;
        } else {
          l_order_headers.push({ name: "tk_net_id", value: +this.dedicated_headers.tk_net_id.value });
        }
      } else {
        if (this.hasHsm()) {
          found = l_order_headers.find((f) => "ota_wrap_mode" == f.name);
          if (found) {
            found.value = this.dedicated_headers.ota_wrap_mode.value;
          } else {
            l_order_headers.push({ name: "ota_wrap_mode", value: this.dedicated_headers.ota_wrap_mode.value });
          }
          // remove tk if not encrypted
          // found = l_order_headers.find((f) => "tk_ota_id" == f.name);
          // if (found) {
          //   l_order_headers = l_order_headers.filter((f) => f.name != found.name);
          // }

          // found = l_order_headers.find((f) => "tk_net_id" == f.name);
          // if (found) {
          //   l_order_headers = l_order_headers.filter((f) => f.name != found.name);
          // }
        }
      }

      for (const [k, v] of Object.entries(this.personal)) {
        if (v.value) {
          personal[k] = {
            mode: v.random ? "random" : "fixed",
          };
          if (personal[k].mode == "fixed") {
            personal[k]["value"] = v.fixed;
          }
          if (k == "adm" && v.hasOwnProperty("digits_only")) {
            if (v.random) {
              personal[k]["digits_only"] = v.digits_only;
            } else {
              delete personal[k]["digits_only"];
            }
          }
        }
      }
      for (const [k, v] of Object.entries(this.card.keys)) {
        if (v.value) {
          card[k] = v.value;
        }
      }

      let linputs = this.order_inputs;

      data["headers"] = l_order_headers;
      data["inputs"] = linputs;
      data["subs"] = subs;
      data["card"] = card;
      data["personal"] = personal;
      this.output.data.inputs = linputs;
      this.output.data.headers = l_order_headers;
      return data;
    },
    onDedicatedFieldChange(p_name, p_event) {
      console.log(`floOrderEnrich - onDedicatedFieldChange - p_name:${p_name}, p_event:${p_event}`);
      let l_order_headers = this.order_headers;
      let found = null;
      found = l_order_headers.find((f) => f.name == p_name);
      if (found) {
        console.log(`floOrderEnrich - onDedicatedFieldChange - FOUND - ${JSON.stringify(found)}`);
        console.log(`floOrderEnrich - onDedicatedFieldChange - FOUND - p_name:${p_name}, changed from:${found.value} to:${p_event}`);
        found.value = p_event;
        if ("hsm_id" == p_name) {
          this.loadHsmKeys(p_event);
        }
      }
    },
    onHeaderChanged(p_product_header, event) {
      console.log(`floOrderEnrich - onHeaderChanged - enter`);
      let l_order_headers = this.order_headers;
      let l_found = l_order_headers.find((f) => f.name == p_product_header.name);
      if (l_found) {
        l_found.value = this.formatHeaderChanges(l_found.name, event);
        console.log(`floOrderEnrich - onHeaderChanged - FOUND - ${p_product_header.name}:${l_found.value}`);
      } else {
        console.log(`floOrderEnrich - onHeaderChanged - NOT FOUND - ${p_product_header.name}`);
        l_order_headers.push({ name: p_product_header.name, value: this.formatHeaderChanges(p_product_header.name, event) });
      }
    },
    onInputChanged(p_product_input, event) {
      console.log(`floOrderEnrich - onInputChanged - enter`);
      let l_order_inputs = this.order_inputs;
      let found = null;
      found = l_order_inputs.find((f) => f.name == p_product_input.name);
      if (found) {
        console.log(`floOrderEnrich - onInputChanged - FOUND - ${p_product_input.name}`);
        found.value = event;
      } else {
        console.log(`floOrderEnrich - onInputChanged - NOT FOUND - ${p_product_input.name}`);
        l_order_inputs.push({ name: p_product_input.name, value: event });
      }
    },
    dialogTitle(item) {
      if (item.data && item.data.name) {
        return `Are you sure you want to remove ${item.type} "${item.data.name}"?`;
      }
      return `Are you sure you want to remove all unknown ${item.type}s?`;
    },
    preDelete(data, type) {
      this.deleteDialog = true;
      this.itemForDeletion.type = type;
      this.itemForDeletion.data = data;
    },
    setDelete() {
      let l_data = this.itemForDeletion.data;
      let l_type = this.itemForDeletion.type;

      if (l_type == "header") {
        l_data == null ? this.removeAllHeaders() : this.removeHeader(l_data);
      } else if (l_type == "input") {
        l_data == null ? this.removeAllInputs() : this.removeInput(l_data);
      }
    },
    removeInput(input) {
      console.log(`floOrderEnrich - removeInput - input:${JSON.stringify(input)}`);
      let l_order_inputs = this.order_inputs;
      this.order_inputs = l_order_inputs.filter((f) => f.name != input.name);
      this.deleteDialog = false;
    },
    removeHeader(header) {
      console.log(`floOrderEnrich - removeHeader - header:${JSON.stringify(header)}`);
      let l_order_headers = this.order_headers;
      this.order_headers = l_order_headers.filter((f) => f.name != header.name);
      this.deleteDialog = false;
    },
    removeAllHeaders() {
      let l_unknown_headers = this.getUnknownProductHeaders();
      let l_order_headers = this.order_headers;

      for (let i = 0; i < l_unknown_headers.length; i++) {
        const uh = l_unknown_headers[i];
        l_order_headers = l_order_headers.filter((f) => f.name != uh.name);
      }
      this.order_headers = l_order_headers;
      this.deleteDialog = false;
    },
    removeAllInputs() {
      let l_unknown_inputs = this.getUnknownProductInputs();
      let l_order_inputs = this.order_inputs;

      for (let i = 0; i < l_unknown_inputs.length; i++) {
        const ui = l_unknown_inputs[i];
        l_order_inputs = l_order_inputs.filter((f) => f.name != ui.name);
      }
      this.order_inputs = l_order_inputs;
      this.deleteDialog = false;
    },
    editInput(input) {
      console.log(`floOrderEnrich - editInput - input:${JSON.stringify(input)}`);
      this.displayEditInfo.type = "input";
      this.displayEditInfo.orig = input;
      this.displayEditInfo.change.name = input.name;
      this.displayEditInfo.change.value = input.value;
      this.displayEdit = true;
    },
    editHeader(header) {
      console.log(`floOrderEnrich - editHeader - header:${JSON.stringify(header)}`);
      this.displayEditInfo.type = "header";
      this.displayEditInfo.orig = header;
      this.displayEditInfo.change.name = header.name;
      this.displayEditInfo.change.value = header.value;
      this.displayEdit = true;
    },
    updateInputOrHeader() {
      let l_items = null;
      if ("header" == this.displayEditInfo.type) {
        l_items = this.order_headers;
      } else if ("input" == this.displayEditInfo.type) {
        l_items = this.order_inputs;
      }

      if (!l_items) {
        return;
      }
      let found = l_items.find((f) => this.displayEditInfo.orig.name == f.name);
      if (found) {
        found.name = this.displayEditInfo.change.name;
        found.value = this.displayEditInfo.change.value;
      }

      this.displayEdit = false;
    },
    formatHeaderValues(name, value) {
      switch (name) {
        case "as_inactive_to":
        case "as_boot_wait_ota_to":
        case "as_boot_sleep_to":
        case "as_boot_disconnected_to":
        case "as_active_next_to": {
          return helpers.formatTime(value);
        }
        default:
          return value;
      }
    },
    formatHeaderChanges(name, event) {
      switch (name) {
        case "as_inactive_to":
        case "as_boot_wait_ota_to":
        case "as_boot_sleep_to":
        case "as_boot_disconnected_to":
        case "as_active_next_to": {
          return event.replaceAll(":", "");
        }
        default:
          return event;
      }
    },
    formatKeyWarnings(keys, i) {
      for (let idx = 0; idx < Object.keys(keys).length; idx++) {
        let key = Object.keys(keys)[i];
        let found = Object.keys(this.getOrderOutput()).find((f) => f.includes(key));

        return found
          ? `${keys[key].hint}
            <br />
            <span class="caption success--text">*Key is already populated.</span>`
          : `${keys[key].hint}
            <br />
            <span class="caption warning--text">*Key is not populated.</span>`;
      }
    },
    formatInputWarnings(input) {
      let hint = "";
      let found = this.order_inputs.find((f) => f.name == input.key || f.name == input.name);
      if (found) {
        if (found.name.startsWith() == "iccid") {
          hint = "Integrated Circuit Card Identifier";
        } else if (found.name.startsWith() == "imsi") {
          hint = "International Mobile Subscriber Identity";
        } else if (found.name.startsWith() == "msisdn") {
          hint = "Mobile Station International Subscriber Directory Number";
        }
      }

      if (this.order.reservation_id && found.value != "") {
        return `
          ${hint}
          <span class="caption warning--text">Value originates from a reservation.</span>`;
      }
    },
    formatServiceData(service, data) {
      this.bindings[service].items = data;
      if (this.product.type == "blank") {
        if (this.blankOrder() || this.localFactoryOrder()) {
          this.bindings[service].items.unshift({
            key: 0,
            value: "Blank",
            disabled: true,
          });
        }
      }
    },
    async loadApns() {
      this.bindings.apn.items = [];
      try {
        let apns = await this.$axios.$post("api/v1/apns/list", {
          select: {
            key: { k: "apn" },
            value: { k: "apn" },
          },
        });
        this.formatServiceData("apn", apns);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHlrs(reload) {
      this.bindings.hlr.items = [];
      if (reload) {
        try {
          let hlrs = await this.$axios.$post("api/v1/registrars/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              op: {},
              mnc_len: {},
              profile_id: {},
              steering_id: {},
              hsm_id: {},
              alg_id: {},
            },
          });
          this.formatServiceData("hlr", hlrs);
        } catch (err) {
          let lerr = this.parseNetError(err);
          if (lerr.statusCode == 403) {
            registrars = [];
          } else {
            this.tellUser("error", lerr);
          }
        }
      }
    },
    async loadSmscs(reload) {
      this.bindings.smsc.items = [];
      if (reload) {
        try {
          let smscs = await this.$axios.$post("api/v1/smscs/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
              smsc_no: {},
            },
          });
          this.formatServiceData("smsc", smscs);
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadBips(reload) {
      this.bindings.bip.items = [];
      if (reload) {
        try {
          let bips = await this.$axios.$post("api/v1/bips/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
            },
          });
          this.formatServiceData("bip", bips);
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadBillings(reload) {
      this.bindings.billing.items = [];
      let billings = [];
      if (reload) {
        try {
          billings = await this.$axios.$post("api/v1/billings/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
            },
          });
          this.formatServiceData("billing", billings);
        } catch (err) {
          let lerr = this.parseNetError(err);
          if (lerr.statusCode == 403) {
            this.bindings.billing.items = billings;
          } else {
            this.tellUser("error", lerr);
          }
        }
      }
    },
    async loadHsms(reload) {
      this.dedicated_headers.hsm_id.items = [];
      if (reload) {
        try {
          let hsms = await this.$axios.$post("api/v1/hsms/list", {
            select: {
              key: { k: "id" },
              value: { k: "name" },
            },
          });
          this.dedicated_headers.hsm_id.items = hsms;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadHsmKeysByType(id, type) {
      try {
        let query = {
          select: {},
          where: [
            {
              k: "hsm_id",
              op: "equal",
              v: id,
            },
            {
              k: "key_type",
              op: "equal",
              v: type,
            },
            {
              k: "status",
              op: "equal",
              v: "active",
            },
          ],
        };
        return (await this.$axios.$post("api/v1/hsm_keys/list", query)).map(({ id, name }) => ({
          key: id,
          value: name,
        }));
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsmKeys(id) {
      this.loading_keys = true;
      [this.tks, this.ki, this.opc] = await Promise.all([this.loadHsmKeysByType(id, "tk"), this.loadHsmKeysByType(id, "ki"), this.loadHsmKeysByType(id, "opc")]);
      this.loading_keys = false;
    },
  },
};
</script>
