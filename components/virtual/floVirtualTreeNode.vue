<template>
  <v-container fluid class="ma-0 pa-0 flo-virtual-tree-node">
    <!-- draw node self items  -->
    <v-row v-if="node.hasOwnProperty('items')" no-gutters>
      <template v-for="(item, idx) in node.items">
        <slot name="item" :item="item" :idx="idx" :gkey="node.gkey"></slot>
      </template>
    </v-row>

    <!-- draw children -->
    <template v-if="node.children && node.children.length">
      <template v-for="(child, ic) in node.children">
        <v-row no-gutters :key="'ic' + ic">
          <v-col cols="12" class="pa-1">
            <flo-expand :title="child.gkey" elevation="5" :open="open" :key="'node-group' + ic">
              <template v-slot:content="{}">
                <flo-virtual-tree-node :node="child">
                  <template v-slot:item="{ item, idx, gkey }">
                    <slot name="item" :item="item" :idx="idx" :gkey="gkey"></slot>
                  </template>
                </flo-virtual-tree-node>
              </template>
            </flo-expand>
          </v-col>
        </v-row>
      </template>
    </template>
  </v-container>
</template>

<script>
export default {
  name: "flo-virtual-tree-node",
  props: {
    node: Object,
    files: {
      type: Boolean,
      required: false,
      default: false,
    },
    open: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>
