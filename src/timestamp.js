import helpers from "~/src/helpers.js";

export default class Timestamp {
  // expected iso format
  static toUI(vsrc) {
    if (typeof vsrc === "undefined") {
      return "";
    }
    if (vsrc.length <= 0) {
      return "";
    }
    let tsDate = new Date(vsrc);
    return tsDate.getFullYear() + "-" + helpers.pad(tsDate.getMonth() + 1, 2) + "-" + helpers.pad(tsDate.getDate(), 2) + " " + helpers.pad(tsDate.getHours(), 2) + ":" + helpers.pad(tsDate.getMinutes(), 2) + ":" + helpers.pad(tsDate.getSeconds(), 2);
  }

  static toSrc(vui) {
    if (typeof vui === "undefined") {
      return "";
    }
    if (vui.length <= 0) {
      return "";
    }
    //console.log(`Timestamp - toSrc`);
    let sdate = null; //split[0];
    let stime = null; //split[1];

    let split = vui.split(" ");
    //console.log(`Timestamp - toSrc - after split: ${JSON.stringify(split)}`);
    if (split.length > 0) {
      sdate = split[0];
    }

    if (split.length > 1) {
      stime = split[1];
    }

    //console.log(`Timestamp - toSrc - sdate: ${sdate}`);
    //console.log(`Timestamp - toSrc - stime: ${stime}`);

    let d = new Date();

    if (sdate !== null) {
      split = sdate.split("-");
      //console.log(`Timestamp - toSrc - sdate split: ${JSON.stringify(split)}`);
      //console.log(`Timestamp - toSrc - sdate split: ${parseInt(split[0], 10)} ${parseInt(split[1], 10) - 1} ${parseInt(split[2], 10)}`);
      d.setFullYear(parseInt(split[0]), parseInt(split[1]) - 1, parseInt(split[2]));
    }

    if (stime !== null) {
      split = stime.split(":");
      //console.log(`Timestamp - toSrc - stime split: ${JSON.stringify(split)}`);
      d.setHours(parseInt(split[0]), parseInt(split[1]), parseInt(split[2]));
      d.setMilliseconds(0);
    }

    let lllll = d.toISOString();
    lllll = lllll.replace("T", " ");
    lllll = lllll.replace("Z", "");

    return lllll;
  }
}
