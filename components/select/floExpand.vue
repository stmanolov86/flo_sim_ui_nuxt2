<template>
  <div class="flo-expand">
    <v-card :loader-height="3" :loading="loading" :disabled="disabled" :elevation="dopen ? elevation : 0" :color="color" class="ma-0 pa-0" outlined>
      <v-card-title class="ma-0 pa-0 align-center">
        <v-container fluid class="ma-0 pa-0 align-center">
          <v-card flat class="mx-auto pa-1" :disabled="loading" @click.native="dopen ? collapse() : expand()">
            <v-card-title class="ma-0 pa-0 align-center font-weight-regular title">
              <v-switch v-if="selectable" v-model="dselected" @change="select($event)" class="pa-0 ma-0" dense color="success" hide-details></v-switch>

              <template v-if="arrows">
                <v-btn :disabled="!arrowup" icon color="primary" class="mx-2 pa-0" @click="up()">
                  <v-icon>mdi-arrow-up-bold</v-icon>
                </v-btn>

                <v-btn :disabled="!arrowdown" icon color="primary" class="mr-2 pa-0" @click="down()">
                  <v-icon>mdi-arrow-down-bold</v-icon>
                </v-btn>
              </template>

              <slot name="title" :title="title" :open="dopen" :selected="dselected">
                <span class="mx-2">{{ title }}</span>
              </slot>

              <slot name="append"></slot>

              <div class="flex-grow-1"></div>

              <template v-if="dopen">
                <v-btn icon class="mr-2 pa-0" :disabled="loading" @click.stop="collapse()">
                  <v-icon>mdi-chevron-up</v-icon>
                </v-btn>
              </template>

              <template v-else>
                <v-btn icon class="mr-2 pa-0" :disabled="loading" @click.stop="expand()">
                  <v-icon>mdi-chevron-down</v-icon>
                </v-btn>
              </template>
            </v-card-title>
          </v-card>
        </v-container>
      </v-card-title>
      <v-expand-transition>
        <v-card-text v-if="dopen" class="ma-0 pa-0 pt-1">
          <slot name="content" :open="dopen"></slot>
        </v-card-text>
      </v-expand-transition>
    </v-card>
  </div>
</template>
<script>
export default {
  name: "flo-expand",
  data: () => ({
    dopen: false,
  }),
  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false,
    },
    selected: {
      type: Boolean,
      required: false,
      default: false,
    },
    arrowup: {
      type: Boolean,
      required: false,
      default: false,
    },
    arrowdown: {
      type: Boolean,
      required: false,
      default: false,
    },
    arrows: {
      type: Boolean,
      required: false,
      default: false,
    },
    elevation: {
      type: [String, Number],
      required: false,
      default: 4,
    },
    open: {
      type: Boolean,
      required: false,
      default: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: "",
    },
  },
  created() {
    if (this.open) {
      this.dopen = true;
    }
    this.dselected = this.selected == true;
  },
  methods: {
    collapse() {
      this.dopen = false;
      this.$emit("collapse", this.dopen);
    },
    expand() {
      this.dopen = true;
      this.$emit("expand", this.dopen);
    },
    select() {
      this.$emit("select", this.dselected);
    },
    up() {
      this.$emit("up");
    },
    down() {
      this.$emit("down");
    },
  },
};
</script>
