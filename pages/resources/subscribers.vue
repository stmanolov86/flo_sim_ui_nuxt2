<template>
  <div>
    <flo-meta-table :key="subs_key" v-if="translator != null" @load-data="onLoadData($event)" @post-update="onPostUpdate($event)" @pre-edit="onPreEdit($event)" @pre-new="onPreNew($event)" @post-delete="onPostDelete($event)" @cancel-action="onCancel()" @pre-import-export-create="onPreImportExportCreate($event)" @pre-import-export-update="onPreImportExportUpdate($event)" @pre-import-export-delete="onPreImportExportDelete($event)" :translator="translator" :init_filter="init_filter" :lookup="lookup" :resources="resources" main_resource :deleteResources="res" :pkeys="['imsi', 'msisdn', 'id']">
      <template v-slot:ex_new="{ fab, color, permissions, smAndDown }">
        <template v-if="permissions.c == true">
          <v-btn v-if="boot_permissions.r == true" :fab="fab" :small="smAndDown" class="mr-1" :color="color" router :to="{ path: '/resources/boots/' }">
            <v-icon :left="!smAndDown">mdi-bootstrap</v-icon>
            {{ !smAndDown ? "Boots" : "" }}
          </v-btn>
        </template>
      </template>

      <template v-slot:edit_ki="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="ki ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" :disabled="!fmtpermissions.u" :readonly="security_readonly" @click:append="ki = !ki" :type="ki ? 'text' : 'password'" v-model="fmtrow.ki" :label="fmtheader.text" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>
      <template v-slot:edit_opc="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <v-text-field :append-icon="opc ? 'mdi-eye' : 'mdi-eye-off'" autocomplete="off" :disabled="!fmtpermissions.u" :readonly="security_readonly" @click:append="opc = !opc" :type="opc ? 'text' : 'password'" v-model="fmtrow.opc" :label="fmtheader.text" :hint="fmtheader.hint" persistent-hint></v-text-field>
        </v-col>
      </template>

      <template v-slot:edit_mcc="{ fmtheader, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12">
          <v-autocomplete v-if="translator !== null" v-model="cmcc" :disabled="!fmtpermissions.u" :items="translator.getKeyValues('countries')" item-text="value" item-value="key" multiple deletable-chips chips clearable label="MCC list" hint="Select MCC availability" color="primary" persistent-hint filled> </v-autocomplete>
        </v-col>
      </template>

      <template v-slot:edit_path="{ fmtheader, fmtrow, fmtpermissions }">
        <v-col :__qa="helpers.getQATag(resources, fmtheader)" cols="12" lg="6">
          <flo-account-select v-model="fmtrow.path" :label="fmtheader.text" :hint="fmtheader.hint" :disabled="!fmtpermissions.u" persistent-hint />
        </v-col>
      </template>

      <template v-slot:view_mcc="{ fmtrow }">
        <v-chip v-for="(mcc, i) in formatMcc(fmtrow.mcc)" :key="i" label color="info" class="mr-1 text-capitalize">{{ mcc }}</v-chip>
      </template>

      <template v-slot:view_state="{ fmtrow }">
        <v-chip v-if="fmtrow.state == 'available'" class="text-capitalize" label color="success">{{ fmtrow.state }}</v-chip>
        <v-chip v-else class="text-capitalize" label color="info">{{ fmtrow.state }}</v-chip>
      </template>

      <template v-slot:view_imsi="{ fmtrow, fmtpermissions }">
        <v-container class="d-flex flex-nowrap">
          <span class="align-self-center text-center ml-n3">{{ fmtrow.imsi }}</span>
          <v-btn
            class="ml-1"
            icon
            elevation="0"
            router
            :disabled="!fmtpermissions.u"
            :to="{
              path: '/resources/subscriber/',
              query: { imsi: fmtrow.imsi },
            }"
          >
            <v-icon center color="info">mdi-link</v-icon>
          </v-btn>
        </v-container>
      </template>

      <template v-slot:external="{ import_export_tabs, import_export_dialog }">
        <flo-hsm-encryption :resources="resources" :tabs="import_export_tabs" :dialog="import_export_dialog" @change="onChange($event)" />
      </template>
      <template v-slot:deleteResources="{}">
        <v-card flat outlined>
          <v-card-subtitle>This will also remove the following resources:</v-card-subtitle>
          <v-card-text>
            <v-row no-gutters>
              <v-col v-for="(r, i) in Object.values(res)" cols="12" :key="i">
                <v-switch v-model="r.value" :hint="r.hint" :label="r.label" :disabled="disable_res" color="success" inset persistent-hint></v-switch>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </template>
    </flo-meta-table>
  </div>
</template>
<script>
import floHsmEncryption from "~/components/widgets/floHsmEncryption";
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
import { mapGetters } from "vuex";
export default {
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
      console.log(`subscribers - fetch - lmcc - is null`);
      let query = {
        select: {
          key: { k: "mcc" },
          value: { k: "country" },
        },
      };

      let array = [];
      try {
        array = await store.$axios.$post(`/api/v1/countries/list`, query);

        for (let i = 0; i < array.length; i++) {
          array[i].value = `${array[i].key}: ${array[i].value}`;
        }

        await store.dispatch("session/addToCache", {
          key: "/denum/mcc",
          value: array,
          expire: 60 * 10,
        });

        // console.log(
        //   `subscribers - fetch - session/addToCache - ok - countries ${JSON.stringify(array)}`
        // );
      } catch (err) {
        console.log(`subscribers - fetch - error - countries: ${err}`);
        return "ok";
      }
    }
  },
  components: {
    floHsmEncryption,
  },
  data: () => ({
    helpers,
    resource: "subscriber",
    resources: "subscribers",
    translator: null,
    boot_permissions: { c: 0, r: 0, u: 0, d: 0 },
    subs_permissions: { c: 0, r: 0, u: 0, d: 0, e: 0 },
    lookup: "",
    ki: false,
    opc: false,
    subs_key: 1,
    security_readonly: true,
    init_filter: [],
    edit_item: null,
    encryption: null,
    disable_res: false,
    hsms: {
      label: "HSM",
      hint: "Hardware Security Module",
      items: [],
      value: 0,
    },
    res: {
      delete_keys: {
        label: "Delete HSM Keys",
        hint: "Deleting may take some time. Please verify that the keys were deleted before adding new ones.",
        value: true,
      },
    },
  }),
  computed: {
    cmcc: {
      get() {
        let item = this.edit_item;
        if (item === null) {
          return [];
        }

        return item.mcc.split(",");
      },
      set(v) {
        console.log(`resource - computed - set - ${JSON.stringify(v)}`);

        let item = this.edit_item;
        if (item === null) {
          return;
        }
        let clean = v.filter((el) => el != "");
        let lmcc = clean.join(",");
        console.log(`resource - computed - set - join - ${lmcc}`);
        this.edit_item.mcc = lmcc;
      },
    },
    ...mapGetters({
      permissions: "session/permissions",
    }),
  },
  async created() {
    await this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      if (typeof this.$route.query.imsi !== "undefined") {
        this.init_filter = [
          {
            k: "imsi",
            op: "equal",
            v: this.$route.query.imsi,
          },
        ];
      }
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      await this.loadHsms(translator);
      await this.loadAccountName(translator);
      await this.loadSmscs(translator);
      await this.loadBips(translator);
      await this.loadOrders(translator);
      let l_res = ["billings", "registrars", "boots", "subscribers"];
      this.permissions
        .filter((p) => l_res.includes(p.res))
        .map((p) => {
          if (p) {
            if (p.hasOwnProperty("res")) {
              if (p.res == "subscribers") {
                this.subs_permissions = p;
              }
              if (p.res == "boots") {
                this.boot_permissions = p;
              }
              if (p.res == "registrars" && p.r == true) {
                this.loadHlrs(translator);
              }
              if (p.res == "billings" && p.r == true) {
                this.loadBillings(translator);
              }
            }
          }
        });

      let lcache = this.$store.getters["session/cache"];
      translator.setEnumEx("countries", lcache["/denum/mcc"].value);
      translator.getKeyValues("countries");
      this.translator = translator;
    },
    async loadHlrs(translator) {
      try {
        let hlrs = await this.$axios.$post("api/v1/registrars/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("hlr_id", hlrs);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadSmscs(translator) {
      try {
        let smscs = await this.$axios.$post("api/v1/smscs/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("smsc_id", smscs);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBips(translator) {
      try {
        let bips = await this.$axios.$post("api/v1/bips/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("bip_id", bips);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadBillings(translator) {
      try {
        let billings = await this.$axios.$post("api/v1/billings/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("billing_id", billings);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHsms(translator) {
      try {
        let hsms = await this.$axios.$post("api/v1/hsms/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        this.hsms.items = hsms;
        translator.setEnumEx("hsm_id", hsms);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadOrders(translator) {
      try {
        let orders = await this.$axios.$post("api/v1/orders/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("order_id", orders);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadAccountName(translator) {
      try {
        let aname = await this.$axios.$post("api/v1/accounts/list", {
          select: {
            key: { k: "id" },
            value: { k: "name" },
          },
        });
        translator.setEnumEx("aname", aname);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadDbEnums(translator) {
      if (!translator.exist("countries")) {
        let query = {
          select: {
            key: { k: "mcc" },
            value: { k: "country" },
          },
        };

        let array = [];
        try {
          array = await this.$axios.$post(`/api/v1/countries/list`, query);

          for (let i = 0; i < array.length; i++) {
            array[i].value = `${array[i].key}: ${array[i].value}`;
          }
        } catch (err) {
          console.log(`subscribers - loadDbEnums - error - countries: ${err}`);
        }
        translator.setEnumEx("countries", array);
      }

      this.translator = translator;
    },
    async sendSubscriberRegistrarSuspend(command) {
      console.log(`sendSubscriberRegistrarSuspend command:${JSON.stringify(command)}`);

      try {
        await this.$axios.$post(`/api/v1/subscribers/registrar/suspend`, command);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async sendSubscriberBillingSuspend(command) {
      console.log(`sendSubscriberBillingSuspend command:${JSON.stringify(command)}`);

      try {
        await this.$axios.$post(`/api/v1/subscribers/billing/suspend`, command);
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async suspendSubscriber(suspend, imsi) {
      let request = {
        command: {
          type: "subscriber",
          action: suspend ? "suspend" : "resume",
          imsi: imsi,
        },
      };

      await this.sendSubscriberRegistrarSuspend(request);
    },
    async suspendSubscriberBilling(suspend, imsi) {
      let request = {
        command: {
          type: "subscriber",
          action: suspend ? "suspend" : "resume",
          imsi: imsi,
        },
      };

      await this.sendSubscriberBillingSuspend(request);
    },
    async saveAllSubscribers(subscribers) {
      let lfailures = [];
      try {
        for (let i = 0; i < subscribers.length; i++) {
          let subscriber = subscribers[i];
          try {
            await this.$axios.$post(`/api/v1/${this.resources.toLowerCase()}`, subscriber);
          } catch (err) {
            this.upload.failure_count++;

            let lfailure = {
              imsi: subscriber.imsi,
              status: 500,
              message: "",
            };

            if (err.hasOwnProperty("response")) {
              console.log(`imsi import: create - fail: ${JSON.stringify(err.response)}`);
              let lerr = this.parseNetError(err);
              lfailure.status = lerr.statusCode;
              lfailure.message = lerr.message;
              this.tellUser("error", lerr);
            } else {
              console.log(`imsi import: create - fail: ${err}`);
              let lerr = this.parseNetError(err);
              this.tellUser("error", lerr);
            }
            lfailures.push(lfailure);
          }

          this.failures = lfailures;
          this.upload.saved_count++;
          this.upload.saved_percent = this.upload.saved_count / (this.upload.parsing_count / 100);
        }

        if (this.upload.failure_count > 0) {
          console.log(`failures: ${JSON.stringify(lfailures)}`);
          this.upload.saved_count = 0;
        }
      } catch (err) {
        console.log(`saveAllSubscribers - FAIL - ${err}:${JSON.stringify(err)}`);
        throw err;
      }
    },
    onPreNew(details) {
      this.edit_item = details.record;
      this.security_readonly = false;
    },
    onPreEdit(details) {
      this.edit_item = details.record;
      this.security_readonly = true;
    },
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "ki":
          case "opc":
            {
              header.view = false;
              header.gpath = "/Security";
            }
            break;
          case "order_id":
            header.gpath = "/Network Resources";
            {
              header.view = false;
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
          case "hlr_id":
          case "smsc_id":
            {
              header.gpath = "/Network Resources";
            }
            break;
          case "billing_id":
          case "bip_id":
          case "hsm_id":
            {
              header.view = false;
              header.gpath = "/Network Resources";
            }
            break;
          case "suspended":
          case "suspended_billing":
            {
              header.view = false;
              header.disable_edit = this.subs_permissions.e ? false : true;
            }
            break;
          case "package":
          case "plmn":
          case "mnc_len":
          case "smsc":
            {
              header.view = false;
            }
            break;
          case "aname":
          case "aid":
            {
              header.view = false;
              header.edit = false;
            }
            break;
          case "path":
            {
              header.view = false;
              header.edit = true;
            }
            break;
        }
      }
    },
    onPostUpdate(data) {
      // suspend the subscriber in the HLR
      if (data.update.suspended != data.record.suspended) {
        this.suspendSubscriber(data.update.suspended, data.update.imsi);
      }

      // suspend the subscriber in the Billing
      if (data.update.suspended_billing != data.record.suspended_billing) {
        this.suspendSubscriberBilling(data.update.suspended_billing, data.update.imsi);
      }
    },
    onCancel() {
      Object.values(this.res).forEach((res) => {
        res.value = true;
      });
    },
    onPostDelete(event) {
      this.disable_res = event.loader;
    },
    onPreImportExportCreate(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        l_event_data["path"] = ",1,";

        if (this.encryption) {
          l_event_data["path"] = this.encryption.path;
          l_event_data["tk_id"] = this.encryption.tk ? this.encryption.tk : null;
          l_event_data["ota_wrap_mode"] = this.encryption.ota_wrap_mode;
          l_event_data["hsm_id"] = this.encryption.hsm_id;
        }
      }
    },
    onPreImportExportUpdate(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        l_event_data["path"] = ",1,";

        if (this.encryption) {
          l_event_data["path"] = this.encryption.path;
          l_event_data["ota_wrap_mode"] = this.encryption.ota_wrap_mode;
          l_event_data["hsm_id"] = this.encryption.hsm_id;
        }
      }
    },
    onPreImportExportDelete(event) {
      if (event && event.data) {
        let l_event_data = event.data;
        l_event_data["delete_keys"] = this.encryption && this.encryption.hasOwnProperty("delete_keys") ? this.encryption.delete_keys : true;
      }
    },
    onChange(event) {
      this.encryption = event;
    },
    formatMcc(mcc) {
      let formatted = [];
      if (mcc.length > 0) {
        formatted = this.translator.getKeyValues("countries").reduce((acc, f) => {
          if (mcc.split(",").includes(f.key) && !acc.includes(f.value)) {
            acc.push(f.value);
          }
          return acc;
        }, []);

        if (formatted.length > 2) {
          formatted.splice(2, 0, "...");
          formatted = formatted.slice(0, 3);
        }
      }

      return formatted;
    },
    removeMcc(item) {
      const index = this.cmcc.indexOf(item.key);
      if (index >= 0) this.cmcc.splice(index, 1);
    },
  },
};
</script>
