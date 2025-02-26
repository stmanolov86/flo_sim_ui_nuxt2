export default class OEnum {
  constructor(oenum) {
    this.oenum = oenum;
  }
  get() {
    return this.oenum;
  }
  toUI(vsrc) {
    for (let i = 0; i < this.oenum.length; i++) {
      let item = this.oenum[i];
      if (item.key == vsrc) return item.value;
    }

    return vsrc;
  }
  toSrc(vui) {
    for (let i = 0; i < this.oenum.length; i++) {
      let item = this.oenum[i];
      if (item.value == vui) return item.key;
    }

    return vui;
  }
  getKeyValues() {
    return this.oenum;
  }
  getValues() {
    return this.oenum.map((e) => e.value);
  }
  getKeys() {
    return this.oenum.map((e) => e.key);
  }
}
