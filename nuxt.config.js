let compression = require("compression");
let proxySetup = {
  proxy: {},
};

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api-docs`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api-docs`].pathRewrite[`^${process.env.ADMIN_UI_BASE}`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/cards/scp/download/`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/cards/scp/download/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}api/v1/cards/scp/download/`] = "/";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/cards/scp/fetch/`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/cards/scp/fetch/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}api/v1/cards/scp/fetch/`] = "/";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}api/v1/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}api/v1/`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}notifications/v1/publish`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}notifications/v1/publish`].pathRewrite[`^${process.env.ADMIN_UI_BASE}`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}notifications/v1/`] = {
  target: process.env.ADMIN_NOTIFICATIONS_URL || process.env.ADMIN_API_URL || "http://127.0.0.1:3001",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}notifications/v1/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}notifications/v1/`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}statistics/v1/publish`] = {
  target: process.env.ADMIN_API_URL || "http://127.0.0.1:3000",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}statistics/v1/publish`].pathRewrite[`^${process.env.ADMIN_UI_BASE}`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}statistics/v1/`] = {
  target: process.env.ADMIN_STATISTICS_URL || process.env.ADMIN_API_URL || "http://127.0.0.1:3002",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}statistics/v1/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}statistics/v1/`] = "";

proxySetup.proxy[`${process.env.ADMIN_UI_BASE}floinventory/v1/`] = {
  target: process.env.ADMIN_INVENTORY_URL || "http://127.0.0.1:3004",
  pathRewrite: {},
};
proxySetup.proxy[`${process.env.ADMIN_UI_BASE}floinventory/v1/`].pathRewrite[`^${process.env.ADMIN_UI_BASE}floinventory/v1/`] = "";

module.exports = {
  telemetry: false,
  render: {
    compressor: {
      filter: function (req, res) {
        if (req.headers.hasOwnProperty("accept")) {
          if (req.headers.accept == "text/event-stream") {
            return false;
          }
        }
        return compression.filter(req, res);
      },
    },
    resourceHints: false,
  },
  env: {
    base: process.env.ADMIN_UI_ROUTE_BASE || "/flosim/",
    ui_version: process.env.GIT_TAG || "x.x.x",
    whoURL: "api/v1/who",
  },
  privateRuntimeConfig: {
    axios: {
      baseURL: process.env.ADMIN_UI_BASE || "privateRuntimeConfig.axios.browserBaseURL",
    },
  },
  publicRuntimeConfig: {
    base: process.env.ADMIN_UI_BASE || "/flosim/",
    route_base: process.env.ADMIN_UI_ROUTE_BASE || "/flosim/",
    uma_endpoint_authz: `${process.env.WS_SEC_UMA_AUTHURL}realms/${process.env.WS_SEC_UMA_REALM}/protocol/openid-connect/auth`,
    uma_endpoint_token: `${process.env.WS_SEC_UMA_AUTHURL}realms/${process.env.WS_SEC_UMA_REALM}/protocol/openid-connect/token`,
    uma_endpoint_usri: `${process.env.WS_SEC_UMA_AUTHURL}realms/${process.env.WS_SEC_UMA_REALM}/protocol/openid-connect/userinfo`,
    uma_endpoint_logout: `${process.env.WS_SEC_UMA_AUTHURL}realms/${process.env.WS_SEC_UMA_REALM}/protocol/openid-connect/logout`,
    uma_client_id: process.env.WS_SEC_UMA_RESOURCE,
  },
  server: {
    port: process.env.ADMIN_LISTEN_PORT || "4000",
    host: process.env.ADMIN_LISTEN_IP || "0.0.0.0",
  },
  router: {
    base: process.env.ADMIN_UI_ROUTE_BASE || "/flosim/",
    middleware: ["auth"],
  },
  ssr: false,
  /*
   ** Headers of the page
   */
  head: {
    titleTemplate: "",
    title: "",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "SIM Management Platform" || "",
      },
    ],
    link: [],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: "#fff" },
  /*
   ** Global CSS
   */
  css: ["~assets/fonts/roboto.css", "~assets/icons/material.css", "~assets/main.scss"],
  /*
   ** Global components registration
   */
  components: {
    dirs: ["~/components/crud", "~/components/dashboard", "~/components/error", "~/components/json", "~/components/misc", "~/components/select", "~/components/widgets", "~/components/se", "~/components/pages", "~/components/rfs", "~/components/charts", "~/components/virtual"],
  },
  /*
   ** Plugins to load before mounting the App
   */
  plugins: ["~/plugins/bus", "~/plugins/axios", "~/plugins/date-time"],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: ["@nuxtjs/vuetify"],
  /*
   ** Nuxt.js modules
   */
  modules: ["@nuxtjs/proxy", "@nuxtjs/axios", "@nuxtjs/auth-next"],
  axios: {
    proxy: true,
    prefix: process.env.ADMIN_UI_BASE || "/axios.proxy.prefix/",
  },
  auth: {
    localStorage: {
      prefix: "auth.",
    },
    cookie: false,
    watchLoggedIn: true,
    resetOnError: true,
    defaultStrategy: "keycloak",
    rewriteRedirects: false,
    strategies: {
      // version 5 auth auth-next
      keycloak: {
        scheme: "~/schemes/keycloakScheme",
        responseMode: "fragment",
        responseType: "code",
        grantType: "authorization_code",
        clientId: process.env.WS_SEC_UMA_RESOURCE,
        scope: ["openid", "profile", "email"],
        codeChallengeMethod: "S256",
        endpoints: {
          authorization: `@@@replaceme@@@`,
          token: `@@@replaceme@@@`,
          userInfo: `@@@replaceme@@@`,
          logout: `@@@replaceme@@@`,
        },
        token: {
          property: "access_token",
          type: "Bearer",
          maxAge: process.env.WS_ACCESS_TOKEN_MAX_AGE | (60 * 5),
        },
        refreshToken: {
          property: "refresh_token",
          type: "Bearer",
          maxAge: process.env.WS_REFRESH_TOKEN_MAX_AGE | (60 * 30), //60 * 30,// 60 * 60 * 24 * 30,
        },
      },
    },
    redirect: {
      login: "/login",
      callback: "/callbacks/hi",
      home: "/dashboard",
      logout: `/callbacks/bye`,
    },
  },
  ...proxySetup,
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: ["~/assets/variables.scss"],
    treeShake: true,
    defaultAssets: false,
    theme: {
      options: {
        customProperties: true,
      },
      dark: false,
      themes: {
        dark: {
          primary: "#536A81",
          accent: "#AB47BC",
          secondary: "#30b1dc",
          success: "#38c23d",
          info: "#2196F3",
          warning: "#ffa90a",
          error: "#FF5252",
          cncs: "#A3E539",
          cnps: "#9c27b0",
          cnlte: "#55CBD8",
          cnsmpp: "#7b68ee",
          cappbar: "#363636",
          cbackground: "#303030",
          pending: "#BABCBE",
        },
        light: {
          primary: "#536A81",
          accent: "#8E24AA",
          secondary: "#30b1dc",
          success: "#99CC65",
          info: "#4285F4",
          warning: "#F8A636",
          error: "#E06057",
          cncs: "#A3E539",
          cnps: "#9c27b0",
          cnlte: "#55CBD8",
          cnsmpp: "#7b68ee",
          cappbar: "#ffffff",
          cbackground: "#fafafa",
          pending: "#BABCBE",
        },
      },
    },
  },
  /*
   ** Build configuration
   */
  build: {
    extractCSS: true,
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      if (ctx && ctx.isClient) {
        config.optimization.splitChunks.maxSize = 51200;
      }
    },
    babel: { compact: true },
  },
};
