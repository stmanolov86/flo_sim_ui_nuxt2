export default {
  methods: {
    tellUser(type, message) {
      this.$bus.$emit("user-msg", { type: type, body: message });
    },
  },
};
