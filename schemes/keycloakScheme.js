import { Oauth2Scheme } from "~auth/runtime";

export default class keycloakScheme extends Oauth2Scheme {
  // Override `fetchUser` method of `local` scheme
  constructor($auth, options, ...defaults) {
    let windowLocation = window.location;
    if (windowLocation.href.includes(windowLocation.host)) {
      if (!windowLocation.href.includes("callbacks") && !windowLocation.href.includes("dashboard")) {
        localStorage.setItem("redirect", `${windowLocation.pathname.split(process.env.base)[1]}${windowLocation.search != "" ? windowLocation.search : ""}`);
      }
    }

    options.endpoints.authorization = $auth.ctx.$config.uma_endpoint_authz;
    options.endpoints.token = $auth.ctx.$config.uma_endpoint_token;
    options.endpoints.userInfo = $auth.ctx.$config.uma_endpoint_usri;
    options.endpoints.logout = $auth.ctx.$config.uma_endpoint_logout;
    options.clientId = $auth.ctx.$config.uma_client_id;

    super($auth, options, ...defaults);
  }
  check(checkStatus) {
    return super.check(checkStatus);
  }
  logout() {
    if (this.options.endpoints.logout) {
      console.log(`keycloakScheme - logout logoutRedirectURI - ${this.logoutRedirectURI}`);
      let final = this.logoutRedirectURI.replace("/callbacks/bye", `${this.$auth.ctx.$config.route_base}callbacks/bye`);
      console.log(`keycloakScheme - logout logoutRedirectURI - final - ${final}`);

      const opts = {
        client_id: this.options.clientId,
        post_logout_redirect_uri: final,
      };
      const url = `${this.options.endpoints.logout}?${new URLSearchParams(opts)}`;
      console.log(`keycloakScheme - logout - url ${url}`);
      window.location.replace(url);
    }
    return this.$auth.strategy.token.reset();
  }
}
