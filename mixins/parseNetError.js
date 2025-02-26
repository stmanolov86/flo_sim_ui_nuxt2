export default {
  methods: {
    parseNetError(err) {
      let AppErr = {
        statusCode: 600,
        message: "",
      };

      if (err.hasOwnProperty("response")) {
        if (err.response.hasOwnProperty("data")) {
          if (err.response.data.hasOwnProperty("status")) {
            AppErr.statusCode = err.response.data.status;
            AppErr.message = err.response.data.message;
          } else {
            AppErr.statusCode = err.response.status;
            AppErr.message = err.response.statusText;
          }
        }
      } else {
        if (err.hasOwnProperty("data")) {
          AppErr.message = `${err.data}`;
        } else {
          AppErr.message = `${err}`;
        }
      }
      return AppErr;
    },
  },
};
