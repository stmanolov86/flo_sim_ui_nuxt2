<template>
  <flo-virtual-tree-node :node="treeData" :files="files" :open="open">
    <template v-slot:item="{ item, idx, gkey }">
      <slot name="item" :item="item" :idx="idx" :gkey="gkey"></slot>
    </template>
  </flo-virtual-tree-node>
</template>

<script>
import floVirtualTreeNode from "~/components/virtual/floVirtualTreeNode";
export default {
  name: "flo-virtual-tree",
  props: {
    treeData: Object,
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
  components: {
    floVirtualTreeNode,
  },
};
</script>
