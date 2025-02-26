import OEnum from "~/src/oenum.js";
import enums from "~/src/enums.js";
import Timestamp from "~/src/timestamp.js";

let g_translators = new Map();

export default class Translator {
  static set(type, translator) {
    if (typeof g_translators.get(type) === "undefined") {
      g_translators.set(type, translator);
    }
  }
  static setEnumEx(type, arr, force) {
    // console.log(`setEnum type:${typeof g_translators.get(type)}`)
    if (typeof g_translators.get(type) === "undefined" || force) {
      // console.log('Translator- enum not found');
      g_translators.set(type, new OEnum(arr));
    }
    // console.log('Translator- enum found');
  }
  static setEnum(type) {
    // console.log(`setEnum type:${typeof g_translators.get(type)}`)
    if (typeof g_translators.get(type) === "undefined") {
      //console.log('Translator- enum not found');
      g_translators.set(type, new OEnum(enums()[type]));
    }
    //console.log('Translator- enum found');
  }
  static setTimeStamp() {
    // console.log(`setEnum type:${typeof g_translators.get(type)}`)
    if (typeof g_translators.get("timestamp") === "undefined") {
      //console.log('Translator- enum not found');
      g_translators.set("timestamp", Timestamp);
    }
    //console.log('Translator- enum found');
  }
  static get(type) {
    return g_translators.get(type);
  }
  static toUI(type, vsrc) {
    let translator = this.get(type);
    return translator.toUI(vsrc);
  }
  static toSrc(type, vui) {
    let translator = this.get(type);
    return translator.toSrc(vui);
  }
}
