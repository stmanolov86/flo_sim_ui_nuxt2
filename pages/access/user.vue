<template>
  <v-container fluid class="ma-0 pa-0">
    <v-card flat outlined>
      <v-card-title class="ma-0">
        <v-container fluid class="ma-0 pa-0">
          <v-row no-gutters>
            <v-col class="ma-0 pa-0" cols="12">
              <div class="headline">User ({{ user.record.name }})</div>
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
                  <img :src="Avatar" :alt="user.record.name" />
                </v-avatar>
                <v-btn :disabled="!isSelf()" @click="openAvatarPicker">Change Avatar</v-btn>
              </v-flex>
            </v-col>

            <v-col cols="12">
              <v-container fluid class="ma-0 pa-0">
                <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="General" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <span v-if="!isSelf()" class="px-2 subheading font-weight-light warning--text">Note: You can't edit someone's else personal details!</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-container fluid>
                          <v-row>
                            <v-col v-if="!isSelf()" cols="12">
                              <span class="subheading font-weight-light warning--text">Note: You can't edit someone's else personal details!</span>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field :disabled="!isSelf()" v-model="user.record.name" label="Name"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field :disabled="!isSelf()" v-model="user.record.email" label="Email"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field disabled v-model="user.record.last_ip" label="Last IP"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field disabled v-model="user.record.last_seen" label="Last seen"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-text-field disabled v-model="user.record.ts" label="Time Stemp"></v-text-field>
                            </v-col>
                            <v-col cols="12" lg="6" xl="4">
                              <v-btn @click="openPassword"> <v-icon left>mdi-lock-outline</v-icon>Change Password </v-btn>
                            </v-col>
                          </v-row>
                        </v-container>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="Account Memberships" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-data-table :headers="memberships.headers" :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" :items="memberships.data" calculate-widths sort-by="res" class="resourcetable elevation-0" :search="memberships.lookup">
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
                        </v-data-table>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>

                <v-row class="ma-1 pa-1">
                  <v-col class="ma-0 pa-0">
                    <flo-expand title="Permissions" elevation="5">
                      <template v-slot:title="{ title }">
                        <span class="title font-weight-regular mx-2">{{ title }}</span>
                        <span v-if="isSelf()" class="px-2 subheading font-weight-light warning--text">Note: You can't edit your own permissions!</span>
                      </template>
                      <template v-slot:content="{}">
                        <v-data-table :headers="permissions.headers" :footer-props="{ 'items-per-page-options': [10, 20, 30, 40, 50] }" :items-per-page="30" :items="permissions.data" calculate-widths sort-by="res" class="resourcetable elevation-0" :search="permissions.lookup">
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
                                    <v-chip color="grey lighten-1" text-color="cappbar" class="mx-4">L</v-chip>
                                    <span>Login limitation</span>
                                    <v-chip color="grey lighten-1" text-color="cappbar" class="mx-4">A</v-chip>
                                    <span>Account limitation</span>
                                  </v-container>
                                </v-col>
                              </v-row>
                            </v-container>
                          </template>

                          <template v-slot:[`item.res`]="{ item }">
                            {{ helpers.capitalizeAllFLetter(item.res, "_") }}
                          </template>

                          <template v-slot:[`item.c`]="{ item }">
                            <div v-if="item.c.resource == 0 ? true : false"></div>
                            <div v-else>
                              <v-chip v-if="item.c.login == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>
                              <v-chip v-if="item.c.account == 0 ? true : false" color="grey lighten-1" text-color="cappbar">A</v-chip>

                              <v-switch v-else color="success" inset v-model="item.c.e" @change="permmisionsDirty(item, 'c')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.r`]="{ item }">
                            <div v-if="item.r.resource == 0 ? true : false"></div>
                            <div v-else>
                              <v-chip v-if="item.r.login == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>
                              <v-chip v-if="item.r.account == 0 ? true : false" color="grey lighten-1" text-color="cappbar">A</v-chip>

                              <v-switch v-else color="success" inset v-model="item.r.e" @change="permmisionsDirty(item, 'r')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.u`]="{ item }">
                            <div v-if="item.u.resource == 0 ? true : false"></div>
                            <div v-else>
                              <v-chip v-if="item.u.login == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>
                              <v-chip v-if="item.u.account == 0 ? true : false" color="grey lighten-1" text-color="cappbar">A</v-chip>

                              <v-switch v-else color="success" inset v-model="item.u.e" @change="permmisionsDirty(item, 'u')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                          <template v-slot:[`item.d`]="{ item }">
                            <div v-if="item.d.resource == 0 ? true : false"></div>
                            <div v-else>
                              <v-chip v-if="item.d.login == 0 ? true : false" color="grey lighten-1" text-color="cappbar">L</v-chip>
                              <v-chip v-if="item.d.account == 0 ? true : false" color="grey lighten-1" text-color="cappbar">A</v-chip>

                              <v-switch v-else color="success" inset v-model="item.d.e" @change="permmisionsDirty(item, 'd')" :disabled="isSelf()"></v-switch>
                            </div>
                          </template>
                        </v-data-table>
                      </template>
                    </flo-expand>
                  </v-col>
                </v-row>
              </v-container>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn class="ma-2" color="primary" @click="$router.go(-1)">Cancel</v-btn>
        <v-btn :readonly="permissions.u != true" class="ma-2" color="primary" @click="save">Save</v-btn>
      </v-card-actions>
    </v-card>
    <avatar-picker :disabled="!isSelf()" v-model="showAvatarPicker" :current-avatar="`${Avatar}`" @selected="selectAvatar"></avatar-picker>
    <v-dialog :overlay-opacity="0.4" v-model="password_dialog" max-width="500px">
      <v-card class="elevation-1 pa-3">
        <v-card-text>
          <div class="layout column align-center">
            <h1 class="flex my-4 primary--text">Update Password</h1>
          </div>
          <v-form>
            <v-text-field append-icon="mdi-lock-outline" name="password" label="Password" id="password" type="password" v-model="password"></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <div class="flex-grow-1"></div>
          <v-btn color="primary" @click="updatePassword">Update</v-btn>
          <v-btn color="primary" @click="closePassword">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import tellUser from "~/mixins/tellUser.js";
import helpers from "~/src/helpers.js";
export default {
  pageTitle: "User",
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
      password_dialog: false,
      password: "",
      user: {
        meta: [],
        headers: [],
        record: {
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
            text: "Membership Id",
            align: "start",
            sortable: true,
            value: "id",
          },
          {
            text: "Account Id",
            align: "start",
            sortable: true,
            value: "aid",
          },
          {
            text: "Name",
            align: "start",
            sortable: true,
            value: "name",
          },
          {
            text: "Description",
            align: "start",
            sortable: true,
            value: "description",
          },
          {
            text: "Path",
            align: "start",
            sortable: true,
            value: "path",
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
    this.$bus.$on("users", this.userChanged);
  },
  beforeDestroy() {
    this.$bus.$off("users");
  },
  computed: {
    isEdit() {
      return true;
    },
    Avatar() {
      if (this.user.record.hasOwnProperty("attr")) {
        if (this.user.record.attr != null) {
          if (this.user.record.attr.hasOwnProperty("avatar")) {
            return this.user.record.attr.avatar;
          }
        }
      }

      return require("~/static/avatars/user-circle.svg");
    },
  },
  mixins: [tellUser],
  methods: {
    isSelf() {
      return this.user.record.email == this.$store.state.session.user.email;
    },
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
      if (this.user.record.hasOwnProperty("attr")) {
        if (this.user.record.attr != null) {
          if (this.user.record.attr.hasOwnProperty("avatar")) {
            return this.user.record.attr.avatar;
          }
        }
      }
      return "mdi-user-circle";
    },
    openAvatarPicker() {
      this.showAvatarPicker = true;
    },
    selectAvatar(avatar) {
      if (this.user.record.attr == null) {
        this.user.record.attr = {};
      }
      this.user.record.attr["avatar"] = avatar;
      console.log(`selectAvatar - ${JSON.stringify(this.user.record.attr.avatar)}`);
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
    userChanged(body) {
      if (body.changed.id != this.user.record.id) return;

      for (const key of Object.keys(body.changed)) {
        this.user.record[key] = body.changed[key];
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
    permissionsEffective(resource, user, account) {
      let array = [];

      let user_permissions = this.$store.state.session.permissions;

      for (let i = 0; i < resource.length; i++) {
        let permission = {
          res: "",
          t: "",
          c: { e: 0, resource: 0, user: 0, account: 0 },
          r: { e: 0, resource: 0, user: 0, account: 0 },
          u: { e: 0, resource: 0, user: 0, account: 0 },
          d: { e: 0, resource: 0, user: 0, account: 0 },
        };

        permission.res = resource[i].res;
        permission.c.resource = resource[i].c;
        permission.r.resource = resource[i].r;
        permission.u.resource = resource[i].u;
        permission.d.resource = resource[i].d;

        let up = user_permissions.find((p) => permission.res == p.res);

        if (typeof up !== "undefined") {
          permission.c.login = up.c;
          permission.r.login = up.r;
          permission.u.login = up.u;
          permission.d.login = up.d;
        } else {
          permission.c.login = permission.r.login = permission.u.login = permission.d.login = 0;
        }

        let da = account.find((p) => permission.res == p.res);
        if (typeof da !== "undefined") {
          permission.c.account = da.c;
          permission.r.account = da.r;
          permission.u.account = da.u;
          permission.d.account = da.d;
        } else {
          permission.c.account = permission.r.account = permission.u.account = permission.d.account = 0;
        }

        let du = user.find((p) => permission.res == p.res);
        if (typeof du !== "undefined") {
          permission.c.user = du.c;
          permission.r.user = du.r;
          permission.u.user = du.u;
          permission.d.user = du.d;
        } else {
          permission.c.user = permission.r.user = permission.u.user = permission.d.user = 0;
        }

        permission.c.e = permission.c.login && permission.c.user;
        permission.r.e = permission.r.login && permission.r.user;
        permission.u.e = permission.u.login && permission.u.user;
        permission.d.e = permission.d.login && permission.d.user;

        array.push(permission);
      }

      return array;
    },
    loadUser() {
      this.$axios.$get(`/api/v1/users/meta`).then((lmeta) => {
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

        this.$axios.$get(`/api/v1/users/${this.$route.query.id}`).then((ldata) => {
          this.user.meta = lmeta;
          this.user.headers = lheaders;
          this.user.record = ldata;
          this.user.loading = false;
        });

        this.$axios.$get(`/api/v1/users/memberships/${this.$route.query.id}`).then((ldata) => {
          this.memberships.data = ldata;
          this.memberships.loading = false;

          this.$axios.$get(`/api/v1/users/permissions/${this.memberships.data[0].id}`).then((ldata) => {
            this.permissions.data = this.permissionsEffective(ldata.resource, ldata.user, ldata.account); // this.permissionsToArray(ldata.result);
            this.permissions.loading = false;
          });
        });
      });
    },
    isEmpty(obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) return false;
      }
      return true;
    },
    getLastSeen() {
      return this.user.record.last_seen.replace("Z", "").replace("T", " ");
    },
    getSuspend() {
      let lret = this.user.record.suspended == 0 ? false : true;
      return lret;
    },
    getSuspendText() {
      let lret = this.user.record.suspended == 0 ? "Suspend" : "Unsuspend";
      return lret;
    },
    initialize() {
      this.permissions.changes = {};
      this.user.record.id = this.$route.query.id;
      this.loadUser();
    },
    openPassword() {
      this.password = "";
      this.password_dialog = true;
    },
    closePassword() {
      this.password = "";
      this.password_dialog = false;
    },
    async updatePassword() {
      let osave = {
        id: this.user.record.id,
        password: this.password,
      };

      this.password = "";
      try {
        let lupdate = await this.$axios.$put(`/api/v1/users/password/${osave.id}`, osave);

        if (lupdate.result.affectedRows > 0) {
          this.initialize();
          this.tellUser("success", `user Id:${osave.id} password updated successfully`);
        }
      } catch (err) {
        this.tellUser("error", JSON.stringify(err));
      }
      this.closePassword();
      return "";
    },
    async save() {
      let osave = {
        user: this.user.record,
        permissions: [],
        memberships: this.memberships.data,
      };

      for (const key of Object.keys(this.permissions.changes)) {
        let change = this.permissions.changes[key];
        change["res"] = key;
        osave.permissions.push(change);
      }

      try {
        let item_id = osave.user.id;
        let lupdate = await this.$axios.$put(`/api/v1/users/${item_id}`, osave);

        if (lupdate.result == "OK") {
          this.initialize();
          this.tellUser("success", `user Id:${item_id} updated successfully`);
        }
      } catch (err) {
        this.tellUser("error", JSON.stringify(err));
      }
      return "";
    },
  },
};
</script>
