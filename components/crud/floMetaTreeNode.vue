<template>
  <v-row class="flo-meta-tree-node">
    <!-- draw node self items  -->
    <template v-if="node.hasOwnProperty('items')">
      <template v-for="(item, idx) in node.items">
        <slot name="item" :item="item" :idx="idx" :gkey="node.gkey">
          <!-- <span :key="'idx-' + idx"> Nested Item: {{ JSON.stringify(item) }} </span> -->
        </slot>
      </template>
    </template>

    <!-- draw children -->
    <template v-if="node.children && node.children.length">
      <v-col v-for="(child, ic) in node.children" cols="12" class="ma-0 pa-1" :key="'ic' + ic">
        <v-card flat outlined>
          <!-- draw node group title  -->
          <v-card-title v-if="node.hasOwnProperty('gkey')" class="ma-1 pa-1 align-center font-weight-regular title">
            {{ child.gkey }}
          </v-card-title>
          <v-card-subtitle v-if="node.hasOwnProperty('spath')">
            {{ node.spath }}
          </v-card-subtitle>

          <v-card-text>
            <!-- draw node children  -->
            <flo-meta-tree-node :node="child" :key="'ic' + ic">
              <template v-slot:item="{ item, idx, gkey }">
                <slot name="item" :item="item" :idx="idx" :gkey="gkey">
                  <!-- <span :key="'idx-' + idx">Nested Child: {{ JSON.stringify(item) }} </span> -->
                </slot>
              </template>
            </flo-meta-tree-node>
          </v-card-text>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>

<script>
export default {
  name: "flo-meta-tree-node",
  props: {
    node: Object,
  },
};
</script>
