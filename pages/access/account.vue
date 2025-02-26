<template>
  <v-container fluid class="ma-0 pa-0">
    <v-card flat outlined>
      <v-card-title class="ma-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row class="ma-0 pa-0">
            <v-col class="ma-0 pa-0" cols="12">
              <div class="headline">Account ({{ account.record.name }})</div>
            </v-col>
          </v-row>
          <v-row class="ma-0 pa-0">
            <v-col class="ma-0 pa-0" cols="12">
              <transition v-if="getSuspend()" name="bounce" appear>
                <img :src="require('~/static/suspended.png')" alt="Suspended" class="align-start" />
              </transition>
            </v-col>
          </v-row>
        </v-container>
      </v-card-title>

      <v-card-text class="ma-0 pa-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col cols="12">
              <v-flex class="px-4">
                <v-avatar size="96" class="mr-4">
                  <img :src="Avatar" :alt="account.record.name" />
                </v-avatar>
                <v-btn @click="openAvatarPicker">Change Logo</v-btn>
              </v-flex>
            </v-col>

            <v-col cols="12">
              <v-container fluid class="ma-0 pa-0">
                <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="General" open elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-container fluid>
                          <v-row>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field v-model="account.record.name" @change="accountDirty($event)" label="Name"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field v-model="account.record.description" @change="accountDirty($event)" label="Description"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field v-model="account.record.logo_text" @change="accountDirty($event)" label="Application Title"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field v-model="account.record.path" @change="accountDirty($event)" label="Path"></v-text-field>
                            </v-col>
                            <!-- <v-col cols="12" lg="6" xl="4">
                              <v-text-field v-model="account.record.session_expire" @change="accountDirty($event)" label="Expire"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-switch v-model="account.record.suspended" color="success" :disabled="!isEdit" inset label="Suspended" @change="accountDirty($event)"></v-switch>
                            </v-col> -->
                          </v-row>
                        </v-container>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <!-- <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="User Memberships" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-data-table :headers="memberships.headers" hide-default-footer :items-per-page="50" :items="memberships.data" calculate-widths sort-by="res" class="resourcetable elevation-1" :search="memberships.lookup">
                          <template v-slot:top>
                            <v-container>
                              <v-row no-gutters>
                                <v-col cols="12" lg="4">
                                  <v-text-field v-model="memberships.lookup" append-icon="mdi-magnify" label="Lookup" single-line hide-details></v-text-field>
                                </v-col>
                              </v-row>
                            </v-container>
                          </template>

                          <template v-slot:[`item.preferred`]="{ item }">
                            <v-switch readonly color="success" inset v-model="item.preferred"></v-switch>
                          </template>
                          <template v-slot:[`item.suspended`]="{ item }">
                            <v-switch readonly color="success" inset v-model="item.suspended"></v-switch>
                          </template>

                          <template v-slot:no-data>
                          </template>
                        </v-data-table>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row> -->

                <!-- <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="Permissions" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <span v-if="isSelf()" class="px-2 subheading font-weight-light warning--text">Note: You can't edit your own permissions!</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-data-table :headers="permissions.headers" hide-default-footer :items-per-page="50" :items="permissions.data" calculate-widths sort-by="res" class="resourcetable elevation-1" :search="permissions.lookup">
                          <template v-slot:top>
                            <v-container>
                              <v-row no-gutters>
                                <v-col cols="12" lg="4">
                                  <v-text-field v-model="permissions.lookup" append-icon="mdi-magnify" label="Lookup" single-line hide-details></v-text-field>
                                </v-col>
                                <v-col cols="12" lg="6">
                                  <v-container>
                                    <div class="flex-grow-1"></div>
                                    <v-chip outlined color="grey darken-2" text-color="grey darken-2" class="mx-4">Empty</v-chip>
                                    <span>Resource limitation</span>
                                    <v-chip color="grey darken-1" text-color="cappbar" class="mx-4">P</v-chip>
                                    <span>Parent limitation</span>
                                    <v-chip color="grey lighten-1" text-color="cappbar" class="mx-4">L</v-chip>
                                    <span>Login limitation</span>
                                  </v-container>
                                </v-col>
                              </v-row>
                            </v-container>
                          </template>

                          <template v-slot:[`item.res`]="{ item }">
                            {{ helpers.capitalizeAllFLetter(item.res, "_") }}
                          </template>

                          <template v-slot:[`item.c`]="{ item }">
                            <div v-if="item.c.resource == 0 ? true : false">
                            </div>
                            <div v-else>
                              <v-chip v-if="item.c.parent == 0 ? true : false" color="grey darken-1" text-color="cappbar">P</v-chip>

                              <v-chip v-if="item.c.user == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>

                              <v-switch v-if="item.c.parent * item.c.user == 0 ? false : true" color="success" inset v-model="item.c.e" @change="permmisionsDirty(item, 'c')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.r`]="{ item }">
                            <div v-if="item.r.resource == 0 ? true : false">
                            </div>
                            <div v-else>
                              <v-chip v-if="item.r.parent == 0 ? true : false" color="grey darken-1" text-color="cappbar">P</v-chip>

                              <v-chip v-if="item.r.user == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>

                              <v-switch v-if="item.r.parent * item.r.user == 0 ? false : true" color="success" inset v-model="item.r.e" @change="permmisionsDirty(item, 'r')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.u`]="{ item }">
                            <div v-if="item.u.resource == 0 ? true : false">
                            </div>
                            <div v-else>
                              <v-chip v-if="item.u.parent == 0 ? true : false" color="grey darken-1" text-color="cappbar">P</v-chip>

                              <v-chip v-if="item.u.user == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>

                              <v-switch v-if="item.u.parent * item.u.user == 0 ? false : true" color="success" inset v-model="item.u.e" @change="permmisionsDirty(item, 'u')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.d`]="{ item }">
                            <div v-if="item.d.resource == 0 ? true : false">
                            </div>
                            <div v-else>
                              <v-chip v-if="item.d.parent == 0 ? true : false" color="grey darken-1" text-color="cappbar">P</v-chip>

                              <v-chip v-if="item.d.user == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>

                              <v-switch v-if="item.d.parent * item.d.user == 0 ? false : true" color="success" inset v-model="item.d.e" @change="permmisionsDirty(item, 'd')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:no-data>
                          </template>
                        </v-data-table>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row> -->
              </v-container>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn color="primary" @click="$router.go(-1)">Cancel</v-btn>
        <v-btn :readonly="permissions.u != true" color="primary" @click="save()">Save</v-btn>
      </v-card-actions>
    </v-card>
    <avatar-picker v-model="showAvatarPicker" :current-avatar="Avatar" @selected="selectAvatar"></avatar-picker>
  </v-container>
</template>

<script>
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  head() {
    return {
      title: "Account",
    };
  },
  data() {
    return {
      helpers,
      accordion: true,
      popout: false,
      inset: false,
      multiple: true,
      disabled: false,
      readonly: false,
      focusable: false,
      panel: [0],
      loading: false,
      showAvatarPicker: false,
      account: {
        meta: [],
        headers: [],
        record: {
          suspended: 0,
          attr: {},
        },
      },
      permissions: {
        loading: false,
        lookup: "",
        headers: [
          {
            text: "Resource",
            align: "start",
            sortable: true,
            value: "res",
          },
          {
            text: "Create",
            align: "start",
            sortable: false,
            value: "c",
          },
          {
            text: "Read",
            align: "start",
            sortable: false,
            value: "r",
          },
          {
            text: "Update",
            align: "start",
            sortable: false,
            value: "u",
          },
          {
            text: "Delete",
            align: "start",
            sortable: false,
            value: "d",
          },
        ],
        data: [],
        changes: {},
      },
      memberships: {
        loading: false,
        lookup: "",
        headers: [
          {
            text: "Id",
            align: "start",
            sortable: true,
            value: "id",
          },
          {
            text: "Name",
            align: "start",
            sortable: true,
            value: "name",
          },
          {
            text: "Email",
            align: "start",
            sortable: true,
            value: "email",
          },
          {
            text: "Expire",
            align: "start",
            sortable: true,
            value: "session_expire",
          },
          {
            text: "Suspended",
            align: "false",
            sortable: true,
            value: "suspended",
          },
          {
            text: "Preferred",
            align: "false",
            sortable: true,
            value: "preferred",
          },
        ],
        data: [],
      },
    };
  },
  created() {
    this.initialize();
  },
  mounted() {
    this.$bus.$on("accounts", this.accountChanged);
  },
  beforeDestroy() {
    this.$bus.$off("accounts");
  },
  computed: {
    isEdit() {
      return true;
    },
    Avatar() {
      if (this.account.record.hasOwnProperty("attr")) {
        if (this.account.record.attr != null) {
          if (this.account.record.attr.hasOwnProperty("avatar")) {
            return this.account.record.attr.avatar;
          }
        }
      }

      return require("~/static/avatars/globe.svg");
    },
  },
  mixins: [tellUser],
  methods: {
    isSelf() {
      return this.account.record.id == this.$store.state.session.membership.aid;
    },
    accountDirty() {},
    permmisionsDirty(event, access) {
      let changes = this.permissions.changes;
      let change = {};

      if (changes.hasOwnProperty(event.res)) {
        change = changes[event.res];
      }
      change[access] = event[access].e ? 1 : 0;

      this.permissions.changes[event.res] = change;
    },
    getAvatar() {
      if (this.account.record.hasOwnProperty("attr")) {
        if (this.account.record.attr != null) {
          if (this.account.record.attr.hasOwnProperty("avatar")) {
            return this.account.record.attr.avatar;
          }
        }
      }
      return "mdi-account-circle";
    },
    openAvatarPicker() {
      this.showAvatarPicker = true;
    },
    selectAvatar(avatar) {
      if (this.account.record.attr == null) {
        this.account.record.attr = {};
      }
      this.account.record.attr["avatar"] = avatar;
      console.log(`selectAvatar - ${JSON.stringify(this.account.record.attr.avatar)}`);
    },
    pad(numStr, digits) {
      numStr = numStr.toString();
      while (numStr.length < digits) numStr = "0" + numStr;
      return numStr;
    },
    toLocalTimeInIsoFormat(ts) {
      let tsDate = new Date(ts);
      return tsDate.getFullYear() + "-" + this.pad(tsDate.getMonth() + 1, 2) + "-" + this.pad(tsDate.getDate(), 2) + "T" + this.pad(tsDate.getHours(), 2) + ":" + this.pad(tsDate.getMinutes(), 2) + ":" + this.pad(tsDate.getSeconds(), 2) + "." + (tsDate.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
    },
    toLocalTimeInIsoFormatUi(ts) {
      let tsDate = new Date(ts);
      return tsDate.getFullYear() + "-" + this.pad(tsDate.getMonth() + 1, 2) + "-" + this.pad(tsDate.getDate(), 2) + " " + this.pad(tsDate.getHours(), 2) + ":" + this.pad(tsDate.getMinutes(), 2) + ":" + this.pad(tsDate.getSeconds(), 2);
    },
    getTsString(ts) {
      return this.toLocalTimeInIsoFormatUi(ts);
    },
    accountChanged(body) {
      if (body.changed.id != this.account.record.id) return;

      for (const key of Object.keys(body.changed)) {
        this.account.record[key] = body.changed[key];
      }
    },
    permissionsToArray(permissions) {
      let array = [];
      for (let i = 0; i < permissions.length; i++) {
        let permission = [];
        permission.push(permissions[i].res);
        permission.push(permissions[i].c);
        permission.push(permissions[i].r);
        permission.push(permissions[i].u);
        permission.push(permissions[i].d);
        array.push(permission);
      }
      return array;
    },
    permissionsEffective(resource, account, parent) {
      let array = [];
      let user_permissions = this.$store.state.session.permissions;
      for (let i = 0; i < account.length; i++) {
        let permission = {
          res: "",
          t: "",
          c: { e: 0, account: 0, user: 0, parent: 0 },
          r: { e: 0, account: 0, user: 0, parent: 0 },
          u: { e: 0, account: 0, user: 0, parent: 0 },
          d: { e: 0, account: 0, user: 0, parent: 0 },
        };

        permission.res = account[i].res;
        permission.t = account[i].t;
        permission.c.account = account[i].c;
        permission.r.account = account[i].r;
        permission.u.account = account[i].u;
        permission.d.account = account[i].d;

        let up = user_permissions.find((p) => permission.res == p.res);
        if (typeof up !== "undefined") {
          permission.c.user = up.c;
          permission.r.user = up.r;
          permission.u.user = up.u;
          permission.d.user = up.d;
        } else {
          permission.c.user = permission.r.user = permission.u.user = permission.d.user = 0;
        }

        let pp = parent.find((p) => permission.res == p.res);
        if (typeof pp !== "undefined") {
          permission.c.parent = pp.c;
          permission.r.parent = pp.r;
          permission.u.parent = pp.u;
          permission.d.parent = pp.d;
        } else {
          permission.c.parent = permission.r.parent = permission.u.parent = permission.d.parent = 0;
        }

        let rp = resource.find((p) => permission.res == p.res);
        if (typeof rp !== "undefined") {
          permission.c.resource = rp.c;
          permission.r.resource = rp.r;
          permission.u.resource = rp.u;
          permission.d.resource = rp.d;
        } else {
          permission.c.resource = permission.r.resource = permission.u.resource = permission.d.resource = 0;
        }

        permission.c.e = permission.c.resource && permission.c.account && permission.c.parent && permission.c.user;

        permission.r.e = permission.r.resource && permission.r.account && permission.r.parent && permission.r.user;

        permission.u.e = permission.u.resource && permission.u.account && permission.u.parent && permission.u.user;

        permission.d.e = permission.d.resource && permission.d.account && permission.d.parent && permission.d.user;

        array.push(permission);
      }

      return array;
    },
    loadAccount() {
      this.$axios.$get(`/api/v1/accounts/meta`).then((lmeta) => {
        let lheaders = [];

        for (const key of Object.keys(lmeta.keys)) {
          let lheader = {
            text: "",
            align: "",
            sortable: true,
            value: "",
            type: "",
          };

          lheader.value = key;
          lheader.align = lmeta.keys[key].align;
          lheader.text = lmeta.keys[key].desc;
          lheader.type = lmeta.keys[key].type;
          lheader.default = lmeta.keys[key].default;
          lheader.width = lmeta.keys[key].width;

          lheaders.push(lheader);
        }

        this.$axios.$get(`/api/v1/accounts/${this.$route.query.id}`).then((ldata) => {
          this.account.meta = lmeta;
          this.account.headers = lheaders;
          this.account.record = ldata;
          this.account.loading = false;
        });

        this.$axios.$get(`/api/v1/accounts/permissions/${this.$route.query.id}`).then((ldata) => {
          this.permissions.data = this.permissionsEffective(ldata.resource, ldata.account, ldata.parent); // this.permissionsToArray(ldata.result);
          this.permissions.loading = false;
        });

        this.$axios.$get(`/api/v1/accounts/memberships/${this.$route.query.id}`).then((ldata) => {
          this.memberships.data = ldata;
          this.memberships.loading = false;
        });
      });
    },
    getLastSeen() {
      return this.account.record.last_seen.replace("Z", "").replace("T", " ");
    },
    getSuspend() {
      let lret = this.account.record.suspended == 0 ? false : true;
      return lret;
    },
    getSuspendText() {
      let lret = this.account.record.suspended == 0 ? "Suspend" : "Unsuspend";
      return lret;
    },
    initialize() {
      this.permissions.changes = {};
      this.account.record.id = this.$route.query.id;
      this.loadAccount();
    },
    async save() {
      let osave = {
        account: this.account.record,
        permissions: [],
      };

      for (const key of Object.keys(this.permissions.changes)) {
        let change = this.permissions.changes[key];
        change["res"] = key;
        osave.permissions.push(change);
      }

      if (osave.account.hasOwnProperty("attr")) {
        if (osave.account.attr != null) {
          osave.account.attr = JSON.stringify(osave.account.attr);
        }
      }
      try {
        let lupdate = await this.$axios.$put(`/api/v1/accounts/${osave.account.id}`, osave);

        if (lupdate.result.affectedRows > 0) {
          this.initialize();
          this.$router.go();
          this.tellUser("success", `account Id:${osave.account.id} updated successfully`);
        }
      } catch (err) {
        this.tellUser("error", JSON.stringify(err));
      }
    },
  },
};
</script>
