<template>
  <v-container fluid :class="['enum', 'tags', 'bool', 'boolean'].includes(this.type) ? 'ma-0 pa-0' : 'mt-3 pa-0'">
    <p v-if="label" class="text-subtitle-2 font-weight-light ma-0 pa-0 info--text mx-1 text-capitalize" v-text="label"></p>
    <slot name="value" :value="value">
      <span class="text-body-1 ma-0 pa-0 mx-1" v-text="value"></span>
    </slot>
    <v-divider class="mx-1"></v-divider>
    <p class="text-caption font-weight-light primary--text mx-1 ma-0 pa-0" v-text="hint"></p>
  </v-container>
</template>

<script>
export default {
  name: "flo-field-label",
  props: {
    value: {
      type: [String, Number, Array, Object, Boolean],
      required: false,
    },
    type: {
      type: String,
      required: false,
    },
    label: {
      type: String,
      required: false,
    },
    hint: {
      type: String,
      required: false,
    },
  },
};
</script>
