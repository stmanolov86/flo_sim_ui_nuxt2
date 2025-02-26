<template>
  <div class="nuxt-error">
    <component :is="errorPage" :error="error" />
  </div>
</template>
<script>
import error404 from "~/components/error/error-404.vue";
import error500 from "~/components/error/error-500.vue";
import error504 from "~/components/error/error-504.vue";
import errorOther from "~/components/error/error-other.vue";
export default {
  name: "nuxt-error",
  layout: "default",
  props: {
    error: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    errorPage() {
      if (this.error.statusCode === 404) {
        return error404;
      } else if (this.error.statusCode === 500) {
        return error500;
      } else if (this.error.statusCode === 504) {
        return error504;
      } else {
        return errorOther;
      }
    },
  },
};
</script>
