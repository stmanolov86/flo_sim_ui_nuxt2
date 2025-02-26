export default function ({ $axios, redirect, store }) {
  $axios.onError((error) => {
    console.log({
      body: `Request failed with status: ${error.response.status}
             Reason: ${error.response.statusText}`,
    });
  });
}
