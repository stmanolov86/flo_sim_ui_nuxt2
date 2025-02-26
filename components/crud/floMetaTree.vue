<template>
  <flo-meta-tree-node :node="treeData">
    <template v-slot:item="{ item, idx, gkey }">
      <slot name="item" :item="item" :idx="idx" :gkey="gkey">
        <!-- <span :key="'idx-' + idx"> Tree: {{ JSON.stringify(item) }} </span> -->
      </slot>
    </template>
  </flo-meta-tree-node>
</template>
<script>
import floMetaTreeNode from "~/components/crud/floMetaTreeNode";
export default {
  name: "flo-meta-tree",
  props: {
    treeData: Object,
  },
  components: {
    floMetaTreeNode,
  },
};
</script>
