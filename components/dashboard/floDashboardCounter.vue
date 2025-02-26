<template>
  <v-container fluid class="flo-dashboard-counter ma-0 pa-0">
    <v-row no-gutters>
      <v-col cols="12" class="ma-0 pa-0">
        <v-card flat outlined>
          <v-card-text class="ma-0 pa-0">
            <v-container fluid class="ma-0 pa-1">
              <v-row no-gutters align="center" justify="center">
                <v-col cols="auto" class="pa-1">
                  <p class="text-no-wrap display-2 font-weight-bold primary--text mb-0">{{ helpers.abbreviateNumber(counter) }}</p>
                </v-col>
              </v-row>

              <v-row no-gutters align="center" justify="center">
                <v-col cols="auto" class="pa-1">
                  <v-container fluid class="d-flex flex-nowrap align-center justify-center mt-0 pt-0">
                    <v-icon v-if="icon" color="primary" large class="pa-1">{{ icon }}</v-icon>
                    <router-link
                      :to="{
                        path: `${link}/`,
                      }"
                    >
                      <span class="text-no-wrap headline font-weight-medium text-capitalize primary--text">
                        {{ name }}
                      </span>
                    </router-link>
                  </v-container>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import helpers from "~/src/helpers.js";
export default {
  name: "flo-dashboard-counter",
  data() {
    return {
      helpers,
    };
  },
  props: {
    counter: {
      type: Number,
      default: 0,
      required: false,
    },
    name: {
      type: String,
      default: "",
      required: false,
    },
    description: {
      type: String,
      default: "",
      required: false,
    },
    icon: {
      type: String,
      default: "",
      required: false,
    },
    link: {
      type: String,
      default: "",
      required: false,
    },
  },
};
</script>
