const express = require("express");
const consola = require("consola");
const { Nuxt, Builder } = require("nuxt");
const app = express();

// Import and Set Nuxt.js options
const config = require("../nuxt.config.js");
console.log(`index.js - ADMIN_UI_ROUTE_BASE - ${process.env.ADMIN_UI_ROUTE_BASE}`);
config.dev = process.env.NODE_ENV !== "production";

const dstart = process.env.NODE_ENV === "dstart";

const fs = require("fs");

function already_built() {
  try {
    if (fs.existsSync("route_base.txt")) {
      let data = fs.readFileSync("route_base.txt", { encoding: "utf8", flag: "r" });
      let ldata = data.trim();

      if (ldata != process.env.ADMIN_UI_ROUTE_BASE) {
        console.log(`ADMIN_UI_ROUTE_BASE changed from ${ldata} to ${process.env.ADMIN_UI_ROUTE_BASE}`);
        return false;
      }
      console.log("already built.");
      return true;
    } else {
      console.log("not built yet.");
      return false;
    }
  } catch (err) {
    console.error("already built err -");
    console.error(err);
    return false;
  }
}

let force_build = false;

if (dstart) {
  config.dev = false;
  force_build = !already_built();
}

function mark_as_built() {
  // create an empty file
  try {
    let fd = fs.openSync("route_base.txt", "w");
    fs.writeSync(fd, process.env.ADMIN_UI_ROUTE_BASE || "");
    fs.closeSync(fd);

    console.log("Mark build.");
  } catch (err) {
    console.error("mark_as_built err -");
    console.log(err);
  }
}

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config);

  const { host, port } = nuxt.options.server;

  // Build only in dev mode
  if (config.dev || (dstart && force_build)) {
    const builder = new Builder(nuxt);
    await builder.build();
    if (dstart) {
      mark_as_built();
    }
  } else {
    await nuxt.ready();
  }

  // Give nuxt middleware to express
  app.use(nuxt.render);

  // Listen the server
  app.listen(port, host);
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true,
  });
}
start();
