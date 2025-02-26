"use strict";

import Translator from "~/src/translator.js";

export default class OTranslator {
  constructor() {
    //console.log(`OTranslator - constructor`);
    this.translators = {}; //new Map();
    //console.log(`OTranslator - constructor - type of:${typeof this.translators}`);
  }

  set(key, translator) {
    //console.log(`OTranslator - set - type of:${typeof this.translators}`);
    //console.log(`OTranslator - set - keys:${key}`);
    // this.translators.set(key, translator);
    this.translators[key] = translator;
    //console.log(`OTranslator - set - translators:${JSON.stringify(this.translators)}`);
  }
  setEnumEx(okey, arr, force) {
    // console.log(`OTranslator - set - before: ${JSON.stringify(arr)}`);
    Translator.setEnumEx(okey, arr, force);
    this.translators[okey] = Translator.get(okey);
    // console.log(`OTranslator - set - after: ${JSON.stringify(this.translators[okey])}`);
  }

  setEnum(okey, oenum) {
    //console.log(`OTranslator - set - type of:${typeof this.translators}`);
    //console.log(`OTranslator - set - keys:${key}`);
    // this.translators.set(key, translator);
    let lenum = oenum;
    if (typeof lenum === "undefined") lenum = okey;

    Translator.setEnum(lenum);
    this.translators[okey] = Translator.get(lenum);
    //console.log(`OTranslator - set - translators:${JSON.stringify(this.translators)}`);
  }
  setTimeStamp(okey) {
    //console.log(`OTranslator - set - type of:${typeof this.translators}`);
    //console.log(`OTranslator - set - keys:${key}`);
    // this.translators.set(key, translator);
    Translator.setTimeStamp();
    this.translators[okey] = Translator.get("timestamp");
    //console.log(`OTranslator - set - translators:${JSON.stringify(this.translators)}`);
  }
  exist(key) {
    return this.hasTranslator(key);
  }
  get(key) {
    return this.translators[key];
  }

  hasTranslator(key) {
    //console.log(`OTranslator - hasTranslator - key:${key}`);
    let t = this.get(key);
    //console.log(`OTranslator - hasTranslator - key:${key} typeof:${typeof t}`);
    if (typeof t === "undefined") {
      return false;
    }

    return true; //this.translators.hasOwnProperty(key);
  }

  getValues(key) {
    let translator = this.get(key);
    if (typeof translator === "undefined") {
      return [];
    }
    return translator.getValues();
  }
  getKeys(key) {
    let lkv = this.getKeyValues(key);
    return lkv.map((i) => i.key);
  }
  getKeyValues(key) {
    let t = this.get(key);
    // console.log(`OTranslator - getKeyValues - key:${key} typeof:${typeof t}`);
    if (typeof t === "undefined") {
      return [];
    }
    return t.getKeyValues();
  }
  toUIByKey(key, value) {
    // console.log(`OTranslator - toUIByKey - key:${key} value:${value}`);
    let translator = this.get(key);
    return translator.toUI(value);
  }
  toUI(osrc) {
    for (const key of Object.keys(this.translators)) {
      //console.log(`OTranslator - key:${key}`);
      if (osrc.hasOwnProperty(key)) {
        let translator = this.get(key);
        osrc[key] = translator.toUI(osrc[key]);
      }
    }

    // let keys = this.translators.keys();
    // console.log(`OTranslator - toUI - keys:${JSON.stringify(keys)}`);
    // for (let i = 0; i < keys.length; i++) {
    //     let key = keys[i];
    //     console.log(`OTranslator - key:${key}`);
    //     if (osrc.hasOwnProperty(key)) {
    //         let translator = this.translators.get(key)
    //         osrc[key] = translator.toUI(osrc[key]);
    //     }
    // }

    return osrc;
  }
  toSrcByKey(key, value) {
    let translator = this.get(key);
    if (typeof translator === "undefined") {
      return "";
    }
    return translator.toSrc(value);
  }
  toSrc(oui) {
    for (const key of Object.keys(this.translators)) {
      //console.log(`OTranslator - key:${key}`);
      if (oui.hasOwnProperty(key)) {
        let translator = this.get(key);
        oui[key] = translator.toSrc(oui[key]);
      }
    }
    // let keys = this.translators.keys();

    // for (let i = 0; i < keys.length; i++) {
    //     let key = keys[i];
    //     if (oui.hasOwnProperty(key)) {
    //         let translator = this.translators.get(key)
    //         oui[key] = translator.toSrc(oui[key]);
    //     }
    // }

    return oui;
  }
}
