<template>
  <v-app>
    <template v-if="is_logged_in">
      <v-snackbar v-model="snackbar.show" vertical bottom right :color="snackbar.type" :timeout="snackbar.timeout">
        <span class="d-inline-flex" style="max-width: 350px">{{ snackbar.message }}</span>
        <v-btn color="cbackground" text @click="snackbar.show = false">Close</v-btn>
      </v-snackbar>

      <v-app-bar clipped-left flat app>
        <template v-if="render_delay">
          <v-app-bar-nav-icon @click.stop="drawer = !drawer" />

          <img :src="logoSvg" alt="logo" height="40" class=".align-self-center pa-0 ma-0" />

          <v-toolbar-title v-if="hasLogoName" class="headline pa-0 ma-0 font-weight-thin">{{ logo_name }}</v-toolbar-title>

          <v-btn v-if="drawer" class="mx-2" icon @click.stop="setMiniVariant">
            <v-icon>{{ `${miniVariant ? "mdi-arrow-expand" : "mdi-arrow-collapse"}` }}</v-icon>
          </v-btn>

          <v-btn class="mx-2" elevation="0" fab small :color="$vuetify.theme.dark ? 'white' : 'grey'" @click.stop="setTheme">
            <v-icon :color="$vuetify.theme.dark ? 'grey' : 'white'"> {{ `${$vuetify.theme.dark ? "mdi-weather-sunny" : "mdi-weather-night"}` }}</v-icon>
          </v-btn>

          <v-btn v-if="enableBack" icon class="mx-2" @click.stop="goBack()">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>

          <v-spacer />

          <v-toolbar-title v-if="$vuetify.breakpoint.mdAndUp" class="mr-4">{{ userInfo.name || userInfo.email }}</v-toolbar-title>

          <v-tooltip bottom v-if="userInfo.name">
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon>
                <v-avatar>
                  <img :src="avatar_image" alt="user" />
                </v-avatar>
              </v-btn>
            </template>
            <span>{{ userInfo.email }}</span>
          </v-tooltip>

          <v-btn v-else icon>
            <v-avatar>
              <img :src="avatar_image" alt="user" />
            </v-avatar>
          </v-btn>

          <v-btn icon class="ma-2" @click="logout">
            <v-icon>mdi-logout</v-icon>
          </v-btn>
        </template>
      </v-app-bar>

      <v-navigation-drawer v-model="drawer" :mini-variant="miniVariant" mini-variant-width="80" clipped app>
        <template v-if="render_delay">
          <v-list>
            <v-list-item two-line>
              <v-icon color="info" class="pr-2" x-large>mdi-sim</v-icon>
              <v-list-item-content class="pa-0">
                <v-list-item-title class="headline">floSIM</v-list-item-title>
                <v-list-item-subtitle>{{ getUiVersion() }}</v-list-item-subtitle>
                <v-list-item-subtitle>{{ getApiVersion() }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-list>

          <v-divider></v-divider>
          <v-list dense expand shaped>
            <template v-for="(menu, i) in limited_menu">
              <v-divider v-if="menu.divider" :key="'d' + i" class="my-1"></v-divider>

              <template v-if="menu.group == 'none' || miniVariant == true">
                <template v-if="menu.items">
                  <v-list-item v-for="(item, j) in menu.items" :key="'i' + i + 'j' + j" :to="item.to" router exact dense>
                    <v-list-item-action>
                      <template v-if="miniVariant == true">
                        <v-icon :title="item.title">{{ item.icon }}</v-icon>
                      </template>

                      <template v-else-if="miniVariant == false">
                        <v-icon>{{ item.icon }}</v-icon>
                      </template>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </template>

              <v-list-group v-else v-model="menu.active" color="info" :key="'g' + i" :prepend-icon="menu.icon" no-action>
                <template v-slot:activator>
                  <v-list-item-content>
                    <v-list-item-title>{{ menu.gtitle }}</v-list-item-title>
                  </v-list-item-content>
                </template>

                <template v-if="menu.items">
                  <v-list-item class="pa-0 ml-6" v-for="(item, j) in menu.items" :key="'gi' + i + 'gj' + j" :to="item.to" router exact>
                    <v-list-item-action class="pa-0 my-0 mx-4">
                      <v-icon>{{ item.icon }}</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title v-if="menu.group === 'Swagger'">
                        <a :href="item.externalLink" target="_blank">
                          {{ item.title }}
                        </a>
                      </v-list-item-title>
                      <v-list-item-title v-else>{{ item.title }} </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list-group>
            </template>
          </v-list>
        </template>
      </v-navigation-drawer>
      <v-main>
        <v-container fluid pa-1 ma-0 style="width: 100%">
          <nuxt />
        </v-container>
      </v-main>
      <v-footer :fixed="fixed" app>
        <template v-if="render_delay">
          <span>&copy; {{ new Date().getFullYear() }}</span>
        </template>
      </v-footer>
    </template>
    <template v-else>
      <v-main>
        <v-container fluid pa-1 ma-0 style="width: 100%">
          <nuxt />
        </v-container>
      </v-main>
    </template>
  </v-app>
</template>

<script>
import { mapMutations, mapActions, mapGetters } from "vuex";
export default {
  head() {
    return {
      titleTemplate: "%s - " + this.logo_text,
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: this.avatar ? this.avatar : "favicon.png",
        },
      ],
    };
  },
  data() {
    return {
      snackbar: { show: false, message: "", type: "success", timeout: 6000 },
      clipped: false,
      drawer: true,
      fixed: false,
      is_logged_in: false,
      render_delay: false,
      menus: [
        {
          group: "none",
          gtitle: "Dashboard",
          force_visible: true,
          divider: false,
          icon: "mdi-view-dashboard",
          items: [
            {
              title: "Dashboard",
              icon: "mdi-view-dashboard",
              to: "/dashboard",
            },
          ],
        },
        {
          group: "access",
          gtitle: "Access",
          divider: true,
          icon: "mdi-card-account-details",
          items: [
            {
              title: "Accounts",
              icon: "mdi-badge-account-outline",
              resource: "accounts",
              to: "/access/accounts",
            },
            {
              title: "Users",
              icon: "mdi-account-circle",
              resource: "users",
              to: "/access/users",
            },
          ],
        },
        {
          group: "network",
          gtitle: "Network",
          divider: true,
          icon: "mdi-radio-tower",
          items: [
            {
              title: "Operators",
              icon: "mdi-radio-tower",
              resource: "operators",
              to: "/network/operators",
            },
            {
              title: "Access Points",
              icon: "mdi-access-point-network",
              resource: "apns",
              to: "/network/apns",
            },
            {
              title: "Registrar",
              icon: "mdi-home-outline",
              resource: "registrars",
              to: "/network/registrar",
            },
            {
              title: "Messaging",
              icon: "mdi-message-text-outline",
              resource: "smscs",
              to: "/network/smsc",
            },
            {
              title: "Bip",
              icon: "mdi-server-network",
              resource: "bips",
              to: "/network/bip",
            },
            {
              title: "Billing",
              icon: "mdi-cash-usd",
              resource: "billings",
              to: "/network/billing",
            },
            {
              title: "HSMs",
              icon: "mdi-security",
              resource: "hsms",
              to: "/network/hsms",
            },
          ],
        },
        {
          group: "resources",
          gtitle: "Resources",
          divider: true,
          icon: "mdi-note-multiple-outline",
          items: [
            {
              title: "Equipment",
              icon: "mdi-devices",
              resource: "tacs",
              to: "/resources/tacs",
            },
            {
              title: "IMEIs",
              icon: "mdi-barcode-scan",
              resource: "imeis",
              to: "/resources/imeis",
            },
            {
              title: "Packages",
              icon: "mdi-package-variant",
              resource: "packages",
              to: "/resources/packages",
            },
            {
              title: "UICCs",
              icon: "mdi-chip",
              resource: "uiccs",
              to: "/resources/uiccs",
            },
            {
              title: "Applets",
              icon: "mdi-matrix",
              resource: "applets",
              to: "/resources/applets",
            },
            {
              title: "Products",
              icon: "mdi-cards-variant",
              resource: "products",
              to: "/resources/products",
            },
            {
              title: "Orders",
              icon: "mdi-cart",
              resource: "orders",
              to: "/resources/orders",
            },
            {
              title: "Subscribers",
              icon: "mdi-account-multiple",
              resource: "subscribers",
              to: "/resources/subscribers",
            },
            {
              title: "Cards",
              icon: "mdi-sim",
              resource: "cards",
              to: "/resources/cards",
            },
            {
              title: "Campaigns",
              icon: "mdi-bullhorn",
              resource: "campaigns",
              to: "/resources/campaigns",
            },
          ],
        },
        {
          group: "monitor",
          gtitle: "Monitor",
          divider: true,
          icon: "mdi-monitor-multiple",
          items: [
            {
              title: "Schema Versions",
              icon: "mdi-buffer",
              resource: "schema_versions",
              to: "/monitor/schema_versions",
            },
            {
              title: "Logs",
              icon: "mdi-clipboard-text-search",
              resource: "logs",
              to: "/monitor/logs",
            },
            {
              title: "Alerts",
              icon: "mdi-sim-alert",
              resource: "alerts",
              to: "/monitor/alerts",
            },
          ],
        },
        {
          group: "Swagger",
          gtitle: "Swagger",
          divider: true,
          icon: "mdi-poll",
          items: [
            {
              title: "floSIM",
              resource: "swagger",
              icon: "mdi-console",
              externalLink: "/flosim/api-docs/",
            },
          ],
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
    };
  },
  computed: {
    ...mapGetters({
      getPermissions: "session/permissions",
      avatar: "session/avatar",
      userInfo: "session/user",
      logo_text: "session/logo_text",
      who: "session/who",
    }),
    title(ctx) {
      return ctx.$root.$meta().refresh().metaInfo.titleChunk;
    },
    enableBack() {
      let l_route = this.$route.name;

      if (l_route != "dashboard") {
        return true;
      } else {
        return false;
      }
    },
    hasLogoImage() {
      let membership = this.$store.state.session.membership;

      if (typeof membership !== "undefined") {
        if (membership.hasOwnProperty("attr")) {
          if (membership.attr != null) {
            if (membership.attr.hasOwnProperty("avatar")) {
              return true;
            }
          }
        }
      }

      if (!this._hasLogoName()) {
        return true;
      }

      return false;
    },
    hasLogoName() {
      if (this.hasLogoImage) {
        return false;
      }

      return this._hasLogoName();
    },
    logo_name() {
      return this.$store.state.session.membership.logo_text;
    },
    logoSvg() {
      let l_avatar = this.avatar;
      if (!this.$vuetify.theme.dark) {
        if (l_avatar) {
          return l_avatar;
        } else {
          return require("../assets/logo_primary.svg");
        }
      } else {
        if (l_avatar) {
          return l_avatar;
        } else {
          return require("../assets/logo_white.svg");
        }
      }
    },
    avatar_image() {
      let user = this.userInfo;
      if (typeof user !== "undefined") {
        if (user.hasOwnProperty("attr")) {
          if (user.attr != null) {
            if (user.attr.hasOwnProperty("avatar")) {
              return user.attr.avatar;
            }
          }
        }
      }
      return require(`../assets/user-circle.svg`);
    },
    limited_menu() {
      let llmenu = [];

      for (let i = 0; i < this.menus.length; i++) {
        let lmenu = this.menus[i];
        // menu and items that don't need permmissions
        if (lmenu.force_visible) {
          llmenu.push(lmenu);
          continue;
        }

        let lnmenu = { items: [] };
        for (let j = 0; j < lmenu.items.length; j++) {
          let litem = lmenu.items[j];
          const lpermission = this.getPermissions.find((p) => p.res == litem.resource);
          if (typeof lpermission !== "undefined") {
            if (lpermission.r == 1) {
              lnmenu.items.push(litem);
            }
          }
        }
        if (lnmenu.items.length > 0) {
          lmenu.items = lnmenu.items;
          llmenu.push(lmenu);
        }
      }

      return llmenu;
    },
  },
  watch: {
    $route(to) {
      this.setActiveGroup(to.path.split("/")[1]);
    },
  },
  async created() {
    await this.initialize();
    this.getStorageData();
  },
  beforeUpdate() {
    this.getActiveGroup();
  },
  beforeDestroy() {
    this.$bus.$off("user-msg");
  },
  methods: {
    ...mapMutations({
      clearState: "session/clearState",
      setPermissions: "session/setPermissions",
    }),
    ...mapActions({
      userLogin: "session/login",
      userLogout: "session/logout",
      webSocketConnect: "session/webSocketConnect",
      webSocketDisconnect: "session/webSocketDisconnect",
      getAccountInfo: "session/getAccountInfo",
      fetchWho: "session/fetchWho",
    }),
    async initialize() {
      if (this.$auth.loggedIn) {
        this.setPerm();
        await this.getAccountInfo();
        await this.fetchWho();
        await this.login();
      }
      this.$bus.$on("user-msg", this.userMsg);
    },
    async login() {
      try {
        await this.userLogin();
        this.webSocketConnect();
        this.render_delay = true;
        this.is_logged_in = true;
      } catch (error) {
        console.log(error);
        this.clearState(true);
        this.webSocketDisconnect();
      }
    },
    goBack() {
      this.$router.go(-1);
    },
    logout() {
      this.userLogout();
      this.setActiveGroup("none");
      setTimeout(() => {
        this.render_delay = false;
        this.clearState(true);
      }, 500);
    },
    setPerm() {
      let lpermissions = this.getPermissions;
      let lauth = this.$auth.loggedIn;
      if (lpermissions.length == 0 && lauth) {
        if (undefined != localStorage.l_kc_permissions) {
          let l_kc_permissions = JSON.parse(localStorage.l_kc_permissions);
          this.setPermissions(l_kc_permissions);
        }
      }
    },
    _hasLogoName() {
      return this.$store.state.session.membership.logo_text != "";
    },
    getUiVersion() {
      return `UI: ${this.getTagVersion(process.env.ui_version)}`;
    },
    getApiVersion() {
      return `API: ${this.getTagVersion(this.who.api_version)}`;
    },
    getTagVersion(tag) {
      if (tag == "development") {
        return tag;
      } else {
        let version = tag.slice(tag.search(/\d/));
        return tag.includes("testing") ? `${version} (Testing)` : version;
      }
    },
    userMsg(msg) {
      if (msg.body.hasOwnProperty("statusCode") && msg.body.hasOwnProperty("message")) {
        this.snackbar.message = `${msg.body.statusCode} - ${msg.body.message}`;
      } else {
        this.snackbar.message = msg.body;
      }
      this.snackbar.type = msg.type;
      this.snackbar.show = true;
    },
    getStorageData() {
      const theme = localStorage.getItem("dark_theme");
      if (theme && theme == "true") {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }

      const variant = localStorage.getItem("mini_variant");
      if (variant && variant == "true") {
        this.miniVariant = true;
      } else {
        this.miniVariant = false;
      }
    },
    setTheme() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    },
    setMiniVariant() {
      this.miniVariant = !this.miniVariant;
      localStorage.setItem("mini_variant", this.miniVariant.toString());
    },
    setActiveGroup(group) {
      localStorage.setItem("active_group", group);
    },
    getActiveGroup() {
      const current_group = localStorage.getItem("active_group");
      this.limited_menu.forEach((lm) => {
        if (lm.group == current_group) {
          lm.active = true;
        }
      });
    },
  },
};
</script>
