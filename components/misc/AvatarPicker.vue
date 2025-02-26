<template>
  <v-dialog :overlay-opacity="0.4" v-model="show" max-width="500px">
    <v-card>
      <v-card-title>
        <span class="headline">Select an application logo</span>
      </v-card-title>

      <v-card-text class="d-flex">
        <v-container>
          <v-row>
            <v-col cols="12">
              <v-avatar size="96">
                <img :src="currentAvatar" alt="Rony" />
              </v-avatar>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12">
              <template>
                <v-file-input :rules="rules" accept="image/png, image/jpeg, image/bmp" placeholder="Pick a logo" prepend-icon="mdi-camera" @change="uploadChanged($event)" label="Logo" :truncate-length="$vuetify.breakpoint.xs ? 25 : 50"></v-file-input>
              </template>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions>
        <div class="flex-grow-1"></div>
        <v-btn color="primary" text @click="close">Cancel</v-btn>
        <v-btn color="primary" text @click="save">Select</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data: () => ({
    rules: [(value) => !value || value.size < 5000000 || "Logo size should be less than 5 MB!"],
    upload: {
      file: {},
    },
    avatar: {},
  }),
  props: {
    currentAvatar: {
      type: String,
      required: true,
    },
    value: Boolean,
  },

  computed: {
    show: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit("input", value);
      },
    },
  },
  methods: {
    close() {
      this.show = false;
    },
    save() {
      this.selectAvatar(this.avatar);
    },
    selectAvatar(avatar) {
      this.$emit("selected", avatar);
      this.show = false;
    },
    readImageFile(file) {
      return new Promise(function (resolve, reject) {
        let reader = new FileReader();

        reader.onload = (e) => {
          // console.log(`csv : ${reader.result}`);
          resolve(reader.result);
        };

        reader.onerror = (e) => {
          // console.log(`csv : ${reader.result}`);
          reject(e);
        };

        reader.readAsDataURL(file);
      });
    },
    uploadChanged(event) {
      this.upload.file = event;
      this.readImageFile(this.upload.file)
        .then((avatar) => {
          this.avatar = avatar;
          console.log(`uploadChanged avatar: ${avatar}:${JSON.stringify(avatar)}`);
        })
        .catch((err) => {});
    },
  },
};
</script>
