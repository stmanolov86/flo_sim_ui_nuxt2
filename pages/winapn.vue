<template>
  <div>
    <v-app-bar color="cbackground" flat app><img src="~/assets/logo_primary.svg" alt="logo" height="40" class="align-self-center pa-0 ma-0" /></v-app-bar>
    <v-container>
      <v-row align="center">
        <v-col class="ml-10 mt-10">
          <p class="text-h4 mb-0 primary--text font-weight-medium">Thank you for using <span class="text-h4 warning--text font-weight-medium">FloLive SIM Card.</span></p>
          <p class="text-h5 mb-0 primary--text font-weight-medium">Please, follow these three simple steps:</p>
          <v-list color="cbackground">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-0 primary--text font-weight-medium">1. Download and install</v-list-item-title>
                <v-list-item-content class="text--secondary"
                  >Start by downloading and installing the floLIVE APN executable file from the download button below. <br /><br />
                  Once the floLIVE APN setup is finished it will restart your device to allow changes to take effect. <br /><br />
                  <p class="text--primary">Note: If the download doesn't start automatically in a few seconds, please click here to access the download URL directly.</p>
                </v-list-item-content>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-hover v-slot:default="{ hover }" open-delay="200">
                <v-btn @click="download()" outlined large color="primary" :elevation="hover ? 8 : 2" :class="{ 'on-hover': hover }" class="mx-1 mt-1 mb-3"> Download </v-btn>
              </v-hover>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-0 primary--text font-weight-medium">2. Let Windows manage this connection</v-list-item-title>
                <v-list-item-content class="text--secondary"
                  ><p>Enable the <span class="text--primary">"Let Windows manage this connection"</span> option.</p>
                  <br />
                  <br />
                  To find this setting, select the Start button, then select Settings > Network & Internet > Cellular > Let Windows manage this connection. This setting is available when you're disconnected from the cellular data network, and it's applied when you select Connect.</v-list-item-content
                >
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="text-h5 mb-0 primary--text font-weight-medium">3. Data roaming options</v-list-item-title>
                <v-list-item-content class="text--secondary"
                  ><p>Make sure your device <span class="text--primary">"Data Roaming option"</span> is set to <span class="text--primary">"Roam".</span></p>
                  <br />
                  <br />
                  To find this setting, select the Start button, then select Settings > Network & Internet > Cellular > Data roaming options.</v-list-item-content
                >
              </v-list-item-content>
            </v-list-item>
          </v-list>
        </v-col>
        <v-col><img src="~/assets/cloud.png" alt="cloud" /></v-col>
      </v-row>
    </v-container>
  </div>
</template>
<script>
export default {
  mounted() {
    setTimeout(() => {
      this.download();
    }, 1500);
  },
  methods: {
    download() {
      let link = document.createElement("a");
      link.setAttribute("download", "FloLiveApns.msi");
      link.href = "/flosim/apns/FloLiveApns.msi";
      document.body.appendChild(link);
      link.click();
      link.remove();
    },
  },
};
</script>
