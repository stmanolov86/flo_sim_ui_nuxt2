<template>
  <div v-if="subscriber.id" class="subscriber">
    <v-card v-if="!loading" flat outlined class="ma-0 pa-0">
      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-1 pa-1">
          <v-row no-gutters>
            <v-col cols="12" class="pa-1">
              <flo-expand title="Details" open elevation="5">
                <template v-slot:content="{}">
                  <flo-meta-resource-view :value="subscriber" resources="subscribers" :ignore="['action', 'path', 'aname', 'aid', 'package']">
                    <template v-slot:view_bip_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_billing_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_hsm_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_hlr_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_order_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                    <template v-slot:view_smsc_id="{ fmtheader }">
                      <v-col cols="12" lg="3" xl="3" class="pa-1">
                        <flo-meta-field-view :translator="translator" :header="formatHeader(fmtheader)" :value="formatHeader(fmtheader).data" />
                      </v-col>
                    </template>
                  </flo-meta-resource-view>
                </template>
              </flo-expand>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </div>
  <error-resource v-else-if="!loading && !subscriber.id" resource="subscriber" path="/resources/subscribers/"></error-resource>
</template>
<script>
import parseNetError from "~/mixins/parseNetError.js";
import OTranslator from "~/src/otranslator.js";
import tellUser from "~/mixins/tellUser.js";
import { mapGetters } from "vuex";
import errorResource from "~/components/error/error-resource.vue";
export default {
  head() {
    return {
      title: "Subscriber",
    };
  },
  components: { errorResource },
  name: "subscriber",
  data: () => ({
    subscriber: {},
    hlr: [],
    smsc: [],
    hsm: [],
    bip: [],
    billing: [],
    order: [],
    loading: true,
    translator: null,
  }),
  computed: {
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
      let translator = new OTranslator();
      translator.setTimeStamp("ts");
      if (this.$route.query.hasOwnProperty("imsi")) {
        this.hidden_filter = [
          {
            k: "imsi",
            op: "equal",
            v: this.$route.query.imsi,
          },
        ];

        await this.loadSubscriber();
        await this.loadSmscs();
        await this.loadHsms();
        await this.loadBips();
        await this.loadOrders();

        let l_res = ["billings", "registrars"];
        this.permissions
          .filter((p) => l_res.includes(p.res))
          .map((p) => {
            if (p) {
              if (p.hasOwnProperty("res")) {
                if (p.res == "registrars" && p.r == true) {
                  this.loadHlrs();
                }
                if (p.res == "billings" && p.r == true) {
                  this.loadBillings();
                }
              }
            }
          });
        this.loading = false;
      }
      this.translator = translator;
    },
    async loadSubscriber() {
      let subscriber = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "imsi",
              op: "equal",
              v: this.$route.query.imsi,
            },
          ],
        };
        subscriber = await this.$axios.$post("api/v1/subscribers/list", query);
        if (subscriber.length > 0) {
          this.subscriber = subscriber[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
    },
    async loadHlrs() {
      let hlr_id = 0;
      let l_hlr = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("hlr_id")) {
          let l_id = l_sub.hlr_id;
          if (l_id != 0) {
            hlr_id = l_id;
          }
        }
      }
      if (hlr_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: hlr_id,
              },
            ],
          };
          l_hlr = await this.$axios.$post("api/v1/registrars/list", query);
          this.hlr = l_hlr;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadSmscs() {
      let smsc_id = 0;
      let l_smsc = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("smsc_id")) {
          let l_id = l_sub.smsc_id;
          if (l_id != 0) {
            smsc_id = l_id;
          }
        }
      }
      if (smsc_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: smsc_id,
              },
            ],
          };
          l_smsc = await this.$axios.$post("api/v1/smscs/list", query);
          this.smsc = l_smsc;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadHsms() {
      let hsm_id = 0;
      let l_hsm = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("hsm_id")) {
          let l_id = l_sub.hsm_id;
          if (l_id != 0) {
            hsm_id = l_id;
          }
        }
      }
      if (hsm_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: hsm_id,
              },
            ],
          };
          l_hsm = await this.$axios.$post("api/v1/hsms/list", query);
          this.hsm = l_hsm;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadBips() {
      let bip_id = 0;
      let l_bip = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("bip_id")) {
          let l_id = l_sub.bip_id;
          if (l_id != 0) {
            bip_id = l_id;
          }
        }
      }
      if (bip_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: bip_id,
              },
            ],
          };
          l_bip = await this.$axios.$post("api/v1/bips/list", query);
          this.bip = l_bip;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadBillings() {
      let billing_id = 0;
      let l_billing = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("billing_id")) {
          let l_id = l_sub.billing_id;
          if (l_id != 0) {
            billing_id = l_id;
          }
        }
      }
      if (billing_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: billing_id,
              },
            ],
          };
          l_billing = await this.$axios.$post("api/v1/billings/list", query);
          this.billing = l_billing;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    async loadOrders() {
      let order_id = 0;
      let l_order = [];
      if (this.subscriber != {}) {
        let l_sub = this.subscriber;
        if (l_sub.hasOwnProperty("order_id")) {
          let l_id = l_sub.order_id;
          if (l_id != 0) {
            order_id = l_id;
          }
        }
      }
      if (order_id != 0) {
        try {
          let query = {
            select: { name: {} },
            where: [
              {
                k: "id",
                op: "equal",
                v: order_id,
              },
            ],
          };
          l_order = await this.$axios.$post("api/v1/orders/list", query);
          this.order = l_order;
        } catch (err) {
          let lerr = this.parseNetError(err);
          this.tellUser("error", lerr);
        }
      }
    },
    formatHeader(header) {
      let l_header = header;
      let l_sub = this.subscriber;
      let l_hlr = this.hlr;
      let l_smsc = this.smsc;
      let l_hsm = this.hsm;
      let l_bip = this.bip;
      let l_billing = this.billing;
      let l_order = this.order;

      l_header.type = "link";
      l_header["path"] = "/network";
      switch (l_header.value) {
        case "hsm_id":
          l_header["path"] = `${l_header["path"]}/hsm_keys/`;
          l_header["query"] = { id: l_sub.hsm_id };
          l_header.data = l_hsm.length > 0 ? l_hsm[0].name : 0;
          break;
        case "order_id":
          l_header["path"] = `/resources/order/`;
          l_header["query"] = { id: l_sub.order_id };
          l_header.data = l_order.length > 0 ? l_order[0].name : 0;
          break;
        case "bip_id":
          l_header["path"] = `${l_header["path"]}/bip/`;
          l_header["query"] = { name: l_bip.length > 0 ? l_bip[0].name : "" };
          l_header.data = l_bip.length > 0 ? l_bip[0].name : "";
          break;
        case "hlr_id":
          l_header["path"] = `${l_header["path"]}/registrar/`;
          l_header["query"] = { name: l_hlr.length > 0 ? l_hlr[0].name : "" };
          l_header.data = l_hlr.length > 0 ? l_hlr[0].name : "";
          break;
        case "smsc_id":
          l_header["path"] = `${l_header["path"]}/smsc/`;
          l_header["query"] = { name: l_smsc.length > 0 ? l_smsc[0].name : "" };
          l_header.data = l_smsc.length > 0 ? l_smsc[0].name : "";
          break;
        case "billing_id":
          l_header["path"] = `${l_header["path"]}/billing/`;
          l_header["query"] = { name: l_billing.length > 0 ? l_billing[0].name : "" };
          l_header.data = l_billing.length > 0 ? l_billing[0].name : "";
          break;
      }

      return l_header;
    },
  },
};
</script>
