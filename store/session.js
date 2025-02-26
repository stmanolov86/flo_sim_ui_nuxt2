import jwt from "jsonwebtoken";
import Vue from "vue";
import { getPermissions } from "~/api/session.js";
import { getWho } from "~/api/session.js";
import helpers from "~/src/helpers.js";

let g_polling_timer_id = null;

export const state = () => ({
  who: {},
  user: { email: "johndoe@flolive.net" },
  avatar: null,
  timer: null,
  logo_text: "",
  token: "",
  refresh_token: "",
  permissions: [],
  membership: {},
  resource_cache: {},
  router_cache: {},
  cache: {},
});

export const mutations = {
  setWho(state, who) {
    Vue.set(state, "who", who);

    if (who.hasOwnProperty("meta_generated_on")) {
      if (who.meta_generated_on != "") {
        who.meta_generated_on = helpers.toLocalTimeInIsoFormatUi(who.meta_generated_on);
      }
    }

    console.log(`setWho - WHO - ${JSON.stringify(state.who)}`);
  },
  setAccountInfo(state, answer) {
    if (answer.hasOwnProperty("attr")) {
      if (answer.attr != null) {
        if (answer.attr.hasOwnProperty("avatar")) {
          Vue.set(state, "avatar", answer.attr.avatar);
        }
      }
    }
    if (answer.hasOwnProperty("logo_text")) {
      let l_logo_text = "";

      if (answer.logo_text != "") {
        l_logo_text = answer.logo_text;
      } else {
        l_logo_text = "SIM Management Platform";
      }

      Vue.set(state, "logo_text", l_logo_text);
    }
  },
  setUser(state, user) {
    Vue.set(state, "user", user);
  },
  setToken(state, token) {
    Vue.set(state, "token", token);
  },
  setRefreshToken(state, refresh_token) {
    Vue.set(state, "refresh_token", refresh_token);
  },
  setPermissions(state, permissions) {
    Vue.set(state, "permissions", permissions);
  },
  setMembership(state, membership) {
    Vue.set(state, "membership", membership);
  },
  setResourceCache(state, resourceCache) {
    Vue.set(state, "resource_cache", resourceCache);
  },
  setCache(state, cache) {
    Vue.set(state, "cache", cache);
  },
  setRouterCache(state, routerCache) {
    Vue.set(state, "router_cache", routerCache);
  },
  setTimer(state, timer) {
    Vue.set(state, "timer", timer);
  },
  storeRouterKey(state, entry) {
    if (!state.router_cache.hasOwnProperty(entry.url)) {
      state.router_cache[entry.url] = {};
    }
    Vue.set(state.router_cache[entry.url], [entry.key], entry.value);
  },
  clearState(state) {
    Vue.set(state, "timer", null);
    Vue.set(state, "token", "");
    Vue.set(state, "refresh_token", "");
    Vue.set(state, "permissions", []);
    Vue.set(state, "membership", {});
    Vue.set(state, "router_cache", {});
    Vue.set(state, "cache", {});
    Vue.set(state, "user", {});
  },
};

export const actions = {
  async fetchWho({ commit }) {
    await getWho().then((res) => {
      commit("setWho", res);
    });
  },
  async getAccountInfo(context) {
    let answer = null;
    try {
      answer = await this.$axios.$get(`/api/v1/accounts/${1}`);
      if (answer) {
        context.commit("setAccountInfo", answer);
      }
    } catch (err) {
      console.log(err);
    }
  },
  addToCache(context, entry) {
    // console.log(`addToCache key:${entry.key} value:${JSON.stringify(entry.value)} expire:${entry.expire}`);
    let lexpire = new Date();
    lexpire.setSeconds(lexpire.getSeconds() + entry.expire);
    let lcache = context.getters.cache;
    lcache[entry.key] = {
      key: entry.key,
      expire: entry.expire,
      value: entry.value,
    };

    context.commit("setCache", lcache);
  },
  addToResourceCache(context, entry) {
    let lexpire = new Date();
    if (!entry.expire) {
      entry["expire"] = 120;
    }

    console.log(`addToResourceCache module: ${entry.module} resource:${entry.resource}, key:${entry.key} expire:${entry.expire}`);

    lexpire.setTime(lexpire.getTime() + entry.expire * 1000);
    // Cache
    let lcache = context.getters.resourceCache;

    // Module Cache
    let mcache = lcache[entry.module];
    if (!mcache) {
      console.log(`addToResourceCache module: ${entry.module} not found. resource:${entry.resource}, key:${entry.key}`);
      lcache[entry.module] = {};
      mcache = lcache[entry.module];
    }

    // Resource Cache
    let rcache = mcache[entry.resource];
    if (!rcache) {
      console.log(`addToResourceCache module: ${entry.module} resource:${entry.resource} not found. key:${entry.key}`);
      mcache[entry.resource] = {};
      rcache = mcache[entry.resource];
    }

    let okey = {
      expire: lexpire,
      value: entry.value,
    };

    rcache[entry.key] = okey;

    context.commit("setResourceCache", lcache);
    // console.log(`addToResourceCache created ... resource:${entry.resource}, key:${entry.key}`);
  },
  clearResourceCache(context, entry) {
    let lcache = context.getters.resourceCache;

    if (!lcache.hasOwnProperty(entry.module)) {
      return;
    }

    let mcache = lcache[entry.module];

    if (!mcache.hasOwnProperty(entry.resource)) {
      return;
    }

    delete mcache[entry.resource];
    context.commit("setResourceCache", lcache);
  },
  getFromCache(context, key) {
    let lcache = context.getters.cache;

    if (!lcache.hasOwnProperty(key)) {
      console.log(`getFromCache doesn't have key:${key}`);
      return null;
    }

    console.log(`getFromCache hasOwnProperty key:${key}`);

    let item = lcache[key];
    let now = new Date();

    if (now > lcache.expire) {
      delete item[key];
      context.commit("setCache", lcache);
      return null;
    }

    return item;
  },
  addToRouterCache(context, entry) {
    let lcache = context.getters.routerCache;
    lcache[entry.key] = {
      key: entry.key,
      value: entry.value,
    };

    context.commit("setRouterCache", lcache);
  },
  async login(context) {
    console.log(`vuex - session - login`);
    let response = {};
    let l_kc_permissions = await getPermissions();
    localStorage.l_kc_permissions = JSON.stringify(l_kc_permissions);

    context.commit("setPermissions", l_kc_permissions);
    context.commit("setUser", this.$auth.user);
    context.commit("setToken", this.$auth.strategy.token.get());
    context.commit("setRefreshToken", this.$auth.strategy.refreshToken.get());
    localStorage.removeItem("redirect");

    return response;
  },
  logout() {
    console.log("vuex - session - logout");
    localStorage.removeItem("query");
    localStorage.removeItem("redirect");
    this.$auth.logout();
  },
  async refreshToken(context, value) {
    console.log(`vuex - session - refreshToken - value:${JSON.stringify(value)}`);
    let response = null;

    try {
      let refresh_token = context.getters.refresh_token;

      if (refresh_token === "") {
        throw { statusCode: 404, message: "no token to refresh" };
      }

      response = await this.$axios.$post(`/api/v1/auth/refresh`, {
        refreshToken: refresh_token,
      });

      console.log(`vuex - session - refreshToken set new token`);
      console.log(`vuex - session - refreshToken - OK`);

      if (!response.hasOwnProperty("accessToken")) {
        throw { statusCode: 404, message: "missing access token" };
      }

      if (!response.hasOwnProperty("refreshToken")) {
        throw { statusCode: 404, message: "missing refresh token" };
      }

      context.commit("setToken", response.accessToken);
      context.commit("setRefreshToken", response.refreshToken);

      console.log(`vuex - session - refreshToken set new default token`);
      this.$axios.defaults.headers.common["Authorization"] = `Bearer ${response.accessToken}`;
      console.log(`vuex - session - refreshToken - decode`);
      let decode = jwt.decode(response.accessToken);

      let expIn = decode.exp * 1000 - Date.now();
      console.log(`vuex - session - refreshToken - will expiresIn ${expIn}`);
      await context.dispatch("timerRefresh", { expiresIn: response.expiresIn });

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  timerRefresh(context, value) {
    console.log(`vuex - session - timerRefresh - value:${JSON.stringify(value)} - ${new Date().toISOString()}`);

    let ltimer = context.getters.timer;
    if (ltimer !== null) {
      try {
        clearTimeout(ltimer);
      } catch (error) {
        console.log(error);
      }
    }

    ltimer = setTimeout(() => {
      console.log(`vuex - session - timerRefresh - expired - ${new Date().toISOString()}`);
      if (context.getters.refresh_token == "") {
        return;
      }

      context.dispatch("refreshToken", {});
    }, (value.expiresIn - 15) * 1000);

    context.commit("setTimer", ltimer);
  },
  async getPermissions() {
    console.log(`loadPermissions - enter`);
    try {
      let response = await getPermissions();
      console.log(`loadPermissions - ok - ${JSON.stringify(response)}`);

      return response;
    } catch (error) {
      console.log(`loadPermissions - failed`);
      throw error;
    }
  },
  webSocketConnect() {
    // console.log(`cWebSock - webSocketConnect - enter`);
    if (null != g_polling_timer_id) {
      return;
    }

    // TODO: may be we need to register for polling .. hmm dont think so we can use the polling timer as keep alive
    // TODO: make polling timeout configurable instead of every 5 sec
    let l_mark = 0;
    g_polling_timer_id = setInterval(async () => {
      let l_continue = true;
      while (l_continue) {
        l_continue = false;
        try {
          // gat all pending messages after mark
          let l_answer = await this.$axios.$get(`/notifications/v1/poll/${l_mark}`);
          if (!l_answer) {
            return;
          }

          // TODO: we need to handle continue
          l_continue = l_answer["continue"];
          // TODO: we need to handle marks
          // l_mark = l_answer["mark"];

          let l_events = l_answer["data"];
          for (let ei = 0; ei < l_events.length; ei++) {
            const l_event = l_events[ei];
            if (l_event.body.hasOwnProperty("mark")) {
              l_mark = l_event.body.mark;
            }
            switch (l_event.notify) {
              case "user-msg":
                this.$bus.$emit("user-msg", {
                  type: l_event.body.type,
                  body: l_event.body.text,
                });
                break;
              case "smss":
                this.$bus.$emit("smss", l_event.body);
                break;
              case "resource-changed":
                this.$bus.$emit(l_event.body.resource, l_event.body);
                break;
              case "location":
                this.$bus.$emit(l_event.notify, l_event.body);
                break;
              case "alert":
                this.$bus.$emit("alert", l_event.body);
                break;
              case "dashboard":
                this.$bus.$emit("dashboard", l_event.body);
                break;
              default:
                console.log(`unknown websocket notification: ${l_event.notify}`);
            }
          }
        } catch (err) {
          // TODO: handle error
          // context.dispatch("webSocketDisconnect");
          console.log(err);
        }
      }
    }, 5000);
  },

  webSocketDisconnect() {
    if (null == g_polling_timer_id) {
      return;
    }
    let l_polling_timer_id = g_polling_timer_id;
    g_polling_timer_id = null;
    clearInterval(l_polling_timer_id);
  },
};

export const getters = {
  who: (state) => state.who,
  user: (state) => state.user,
  avatar: (state) => state.avatar,
  logo_text: (state) => state.logo_text,
  token: (state) => state.token,
  timer: (state) => state.timer,
  refresh_token: (state) => state.refresh_token,
  cache: (state) => state.cache,
  routerCache: (state) => state.router_cache,
  resourceCache: (state) => state.resource_cache,
  permissions: (state) => state.permissions,
  getRouterCacheByUrl: (state) => (url) => {
    if (!state.router_cache.hasOwnProperty(url)) {
      console.log(`getRouterCacheByUrl doesn't have key:${url}`);
      return null;
    }
    return state.router_cache[url];
  },
  getResourceKey: (state) => (module, resource, key) => {
    console.log(`getResourceKey - module: ${module}, resource: ${resource}, key: ${key}`);
    if (!state.resource_cache.hasOwnProperty(module)) {
      console.log(`getResourceKey: has no module: ${module}`);
      return null;
    }

    let omodule = state.resource_cache[module];

    if (!omodule.hasOwnProperty(resource)) {
      console.log(`getResourceKey: module: ${module}, resource: ${resource} no such resource`);
      return null;
    }

    let oresource = omodule[resource];

    if (!oresource.hasOwnProperty(key)) {
      console.log(`getResourceKey: module: ${module}, resource: ${resource}, key: ${key} no such key`);
      return null;
    }

    let okey = oresource[key];

    let lnow = new Date();
    // check if expierd
    if (okey.expire < lnow) {
      console.log(`getResourceKey: module: ${module}, resource: ${resource}, key: ${key} expire !!`);
      return null;
    }

    return okey.value;
  },
};
