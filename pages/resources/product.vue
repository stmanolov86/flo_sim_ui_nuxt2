<template>
  <div v-if="product">
    <v-dialog :overlay-opacity="0.4" v-model="unsaved_action_dialog" persistent width="auto ">
      <v-card flat>
        <v-card-title>
          <v-row no-gutters justify="center">
            <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'">
              <v-icon x-large color="warning">mdi-alert</v-icon>
            </v-col>
          </v-row>
        </v-card-title>
        <v-card-text>
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="title text--primary">You have unsaved changes!</span> </v-col>
            </v-row>
            <v-row no-gutters justify="center">
              <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'"><span class="body-1 text--primary">Leaving the page now will result in loss of all data.</span> </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" text @click="unsaved_action_dialog = false">Cancel</v-btn>
          <v-btn color="primary" text @click="leavePage()">Leave</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <flo-product v-model="product" @unsaved-action="onUnsavedAction($event)"></flo-product>
  </div>
  <error-resource v-else-if="!loading && !product" resource="product" path="/resources/products/"></error-resource>
</template>
<script>
import floProduct from "~/components/pages/resources/products/floProduct";
import parseNetError from "~/mixins/parseNetError.js";
import tellUser from "~/mixins/tellUser.js";
export default {
  components: {
    floProduct,
  },
  async fetch({ store }) {
    let lmcc = await store.dispatch("session/getFromCache", "/denum/mcc");
    if (lmcc == null) {
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
      } catch (err) {
        console.log(`products - fetch - error - countries: ${err}`);
        return "ok";
      }
    }
  },
  data: () => ({
    route_to: "",
    product: null,
    loading: true,
    unsaved_action: false,
    unsaved_action_dialog: false,
  }),
  created() {
    this.initialize();
  },
  mixins: [tellUser, parseNetError],
  methods: {
    async initialize() {
      await this.loadProduct();
    },
    async loadProduct() {
      let product = [];
      try {
        let query = {
          select: {},
          where: [
            {
              k: "id",
              op: "equal",
              v: this.$route.query.id,
            },
          ],
        };
        product = await this.$axios.$post("api/v1/products/list", query);
        if (product.length > 0) {
          this.product = product[0];
        }
      } catch (err) {
        let lerr = this.parseNetError(err);
        this.tellUser("error", lerr);
      }
      this.loading = false;
    },
    onUnsavedAction(event) {
      this.unsaved_action = event;
    },
    leavePage() {
      this.unsaved_action = false;
      this.unsaved_action_dialog = false;
      this.$router.push(this.route_to);
    },
  },
  beforeRouteLeave(to, from, next) {
    if (this.unsaved_action) {
      this.unsaved_action_dialog = true;
      this.route_to = to;
      next(false);
    } else {
      next();
    }
  },
};
</script>
