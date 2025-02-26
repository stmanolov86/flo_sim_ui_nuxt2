<template>
  <div>
    <flo-meta-table @load-data="onLoadData($event)" :resources="resources"></flo-meta-table>
  </div>
</template>
<script>
import floMetaTable from "~/components/crud/floMetaTable.vue";
export default {
  data: () => ({
    resources: "product_applets",
  }),
  components: {
    floMetaTable,
  },
  methods: {
    onLoadData(data) {
      for (const header of data.headers) {
        switch (header.value) {
          case "id":
          case "ts":
            {
              header.disable_edit = true;
              header.disable_new = true;
            }
            break;
        }
      }
    },
  },
};
</script>
