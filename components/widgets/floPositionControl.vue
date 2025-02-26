<template>
  <v-card outlined flat class="ma-0 pa-0 flo-position-control">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters v-if="!disableNew">
        <v-col cols="12" class="pa-1 d-flex justify-end">
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-btn icon small elevation="0" @click="add()" :disabled="disabled || readonly" v-on="on">
                <v-icon color="primary">mdi-plus-thick</v-icon>
              </v-btn>
            </template>
            <span>Add Operation</span>
          </v-tooltip>
        </v-col>
      </v-row>

      <v-row no-gutters>
        <v-col cols="12">
          <v-container fluid class="ma-0 pa-0">
            <v-row no-gutters v-for="(item, idx) in items" :key="idx">
              <v-col cols="12" class="pa-1">
                <v-card outlined flat class="ma-0 pa-0">
                  <v-container fluid class="ma-0 pa-0">
                    <v-row no-gutters>
                      <v-col cols="12" lg="11" xl="11">
                        <slot name="content" :item="item" :idx="idx"></slot>
                      </v-col>

                      <v-col cols="12" lg="1" xl="1" v-if="multiple" class="ma-0 pa-1 d-flex justify-center align-center">
                        <v-card outlined class="ma-0 pa-0">
                          <v-container fluid class="ma-0 pa-0">
                            <v-row no-gutters>
                              <v-col cols="12" class="ma-0 pa-0 d-flex justify-center align-center">
                                <v-btn icon small elevation="0" @click="up(idx)" :disabled="disabled || readonly" class="ma-1">
                                  <v-icon color="primary">mdi-arrow-up-thick</v-icon>
                                </v-btn>

                                <v-btn icon small elevation="0" @click="down(idx)" :disabled="disabled || readonly" class="ma-1">
                                  <v-icon color="primary">mdi-arrow-down-thick</v-icon>
                                </v-btn>

                                <v-btn icon small elevation="0" @click="remove(idx)" :disabled="disabled || readonly" class="ma-1">
                                  <v-icon color="error">mdi-delete</v-icon>
                                </v-btn>
                              </v-col>
                            </v-row>
                          </v-container>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
export default {
  name: "flo-position-control",
  props: {
    value: {
      type: [String, Number, Object, Array],
      required: false,
    },
    items: {
      type: [Object, Array],
      required: true,
      default: () => [],
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    disableNew: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    add() {
      if (typeof this.value == "object") {
        let lval = JSON.parse(JSON.stringify(this.value));
        this.items.push(lval);
      } else {
        this.items.push(this.value);
      }
    },
    up(idx) {
      this.move(idx, idx - 1);
    },
    down(idx) {
      this.move(idx, idx + 1);
    },
    move(from, to) {
      let item = this.items.splice(from, 1)[0];
      this.items.splice(to, 0, item);
    },
    remove(idx) {
      this.items.splice(idx, 1);
    },
  },
};
</script>
