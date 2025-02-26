"use strict";
import helpers from "~/src/helpers.js";
export default class DateUtils {
  static get_resolutions() {
    const r = [
      {
        f: "toStartOfYear",
        r: "Year",
        unit: "year",
        value: 1,
        onlyDate: true,
        onlyTime: false,
        func: this.toStartOfYear,
      },
      {
        f: "toStartOfQuarter",
        r: "Quarter",
        unit: "quarter",
        value: 1,
        onlyDate: true,
        onlyTime: false,
        func: this.toStartOfQuarter,
      },
      {
        f: "toStartOfMonth",
        r: "Month",
        unit: "month",
        value: 1,
        onlyDate: true,
        onlyTime: false,
        func: this.toStartOfMonth,
      },
      {
        f: "toStartOfWeek",
        r: "Week",
        unit: "week",
        value: 1,
        onlyDate: true,
        onlyTime: false,
        func: this.toStartOfWeek,
        minuteInterval: 60 * 24 * 7,
      },
      {
        f: "toStartOfDay",
        r: "Day",
        unit: "day",
        value: 1,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfDay,
        minuteInterval: 60 * 24,
      },
      {
        f: "toStartOfHour",
        r: "Hour",
        unit: "hour",
        value: 1,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfHour,
        minuteInterval: 60,
      },
      {
        f: "toStartOfFifteenMinutes",
        r: "15 min",
        unit: "minute",
        value: 15,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfFifteenMinutes,
        minuteInterval: 15,
      },
      {
        f: "toStartOfTenMinutes",
        r: "10 min",
        unit: "minute",
        value: 10,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfTenMinutes,
        minuteInterval: 10,
      },
      {
        f: "toStartOfFiveMinute",
        r: "5 min",
        unit: "minute",
        value: 5,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfFiveMinute,
        minuteInterval: 5,
      },
      {
        f: "toStartOfMinute",
        r: "1 min",
        unit: "minute",
        value: 1,
        onlyDate: false,
        onlyTime: false,
        func: this.toStartOfMinute,
        minuteInterval: 1,
      },
      {
        f: "toStartOfThirtySecond",
        r: "Second",
        unit: "second",
        value: 30,
        onlyDate: false,
        onlyTime: true,
        func: this.toStartOfThirtySecond,
      },
      {
        f: "toStartOfFifteenSecond",
        r: "Second",
        unit: "second",
        value: 15,
        onlyDate: false,
        onlyTime: true,
        func: this.toStartOfFifteenSecond,
      },
      {
        f: "toStartOfFifteenSecond",
        r: "Second",
        unit: "second",
        value: 15,
        onlyDate: false,
        onlyTime: true,
        func: this.toStartOfFifteenSecond,
      },
      {
        f: "toStartOfTenSecond",
        r: "Second",
        unit: "second",
        value: 10,
        onlyDate: false,
        onlyTime: true,
        func: this.toStartOfTenSecond,
      },
      {
        f: "toStartOfSecond",
        r: "Second",
        unit: "second",
        value: 1,
        onlyDate: false,
        onlyTime: true,
        func: this.toStartOfSecond,
      },
    ];

    return r;
  }
  static get_resolution_by_func_name(name) {
    let found = this.get_resolutions().filter((r) => r.f.toUpperCase() == name.toUpperCase());
    if (found.length === null) {
      return;
    }

    return found[0];
  }
  static get_resolution_by_name(name) {
    let found = this.get_resolutions().filter((r) => r.r.toUpperCase() == name.toUpperCase());
    if (found.length === null) {
      return;
    }

    return found[0];
  }

  static odate_to_ch_str(d) {
    return d
      .toISOString()
      .replace("T", " ")
      .replace(/\.[0-9]{3}Z/, "");
  }

  static ch_str_to_odate(d) {
    return `${d}Z`;
  }

  static round_to_minutes(date, minutes) {
    // ms in 5 minutes.
    const coff = 1000 * 60 * minutes;
    return new Date(Math.floor(date.getTime() / coff) * coff);
  }

  static toStartOfMinute(t) {
    let d = new Date(t);
    d.setUTCSeconds(0, 0);
    return d;
  }

  static toStartOfThirtySecond(t) {
    // console.log(`toStartOfFiveMinute ${t}`);

    // return this.round_to_minutes(t, 5);
    // ms in 5 minutes.
    const coff = 1000 * 30;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfFifteenSecond(t) {
    // console.log(`toStartOfFiveMinute ${t}`);

    // return this.round_to_minutes(t, 5);
    // ms in 5 minutes.
    const coff = 1000 * 15;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfTenSecond(t) {
    // console.log(`toStartOfFiveMinute ${t}`);

    // return this.round_to_minutes(t, 5);
    // ms in 5 minutes.
    const coff = 1000 * 10;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfSecond(t) {
    // console.log(`toStartOfFiveMinute ${t}`);

    // return this.round_to_minutes(t, 5);
    // ms in 5 minutes.
    const coff = 1000 * 1;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfFiveMinute(t) {
    // console.log(`toStartOfFiveMinute ${t}`);

    // return this.round_to_minutes(t, 5);
    // ms in 5 minutes.
    const coff = 1000 * 60 * 5;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfTenMinutes(t) {
    const coff = 1000 * 60 * 10;
    return new Date(Math.floor(t.getTime() / coff) * coff);
  }
  static toStartOfFifteenMinutes(t) {
    return this.round_to_minutes(t, 15);
  }
  static toStartOfHour(t) {
    let d = new Date(t);
    d.setUTCMinutes(0, 0, 0);
    return d;
  }

  static getMonday(d) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday

    return new Date(d.setDate(diff));
  }

  static toStartOfWeek(t) {
    return this.getMonday(t);
  }

  static toStartOfDay(t) {
    let d = new Date(t);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  static toStartOfMonth() {
    let d = new Date(d);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(1);
    return d;
  }

  static toStartOfQuarter() {
    let d = new Date(d);
    // 0 - January, February, and March (Q1)
    // 3 - April, May, and June (Q2)
    // 6 - July, August, and September (Q3)
    // 9 - October, November, and December (Q4)

    d.setUTCHours(0, 0, 0, 0);

    // devide by quarter (3 mounth) 0 -> 11
    let m = d.getUTCMonth();
    if (m != 0) {
      m = Math.ceil(m / 3);
    }
    // set the month and day
    d.setUTCMonth(m * 3, 1);
    return d;
  }

  static toStartOfYear() {
    let d = new Date(d);
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCMonth(0, 1);
    return d;
  }

  // click house UTC to ISO-8601
  static chUtcToIsoUtc(chUtc) {
    return `${chUtc}.00Z`;
  }

  // click house UTC to Date Object
  static chUtcToLocalDate(chUtc) {
    return new Date(this.chUtcToIsoUtc(chUtc));
  }

  // local time format to date object
  localLikeIsoToLocalDate(localStr) {
    return new Date(localStr);
  }

  // local time format to click house format
  static localLikeIsoToCh(localStr) {
    let temp = this.localLikeIsoToLocalDate(localStr);

    let isoTemp = temp.toISOString();

    isoTemp = isoTemp.replace("T", " ");
    isoTemp = isoTemp.slice(0, -5);

    return isoTemp;
  }

  // date object to local time string in soratble iso like (with no T, no millisconds) format
  // example: 2022-08-08 09:48:57
  static localToLocalLikeIso(ts) {
    if (!ts) {
      return "";
    }

    let tsDate = ts;

    return tsDate.getFullYear() + "-" + helpers.pad(tsDate.getMonth() + 1, 2) + "-" + helpers.pad(tsDate.getDate(), 2) + " " + helpers.pad(tsDate.getHours(), 2) + ":" + helpers.pad(tsDate.getMinutes(), 2) + ":" + helpers.pad(tsDate.getSeconds(), 2);
  }
  // same as localToLocalLikeIso with no delimiters no space only numbers
  // example: 20220808094857
  static localToLocalLikeIsoNumOnly(ts) {
    let tsDate = ts;

    return tsDate.getFullYear() + helpers.pad(tsDate.getMonth() + 1, 2) + helpers.pad(tsDate.getDate(), 2) + helpers.pad(tsDate.getHours(), 2) + helpers.pad(tsDate.getMinutes(), 2) + helpers.pad(tsDate.getSeconds(), 2);
  }

  static addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  }
  static subMinutes(date, minutes) {
    return new Date(date.getTime() - minutes * 60000);
  }
  static addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000);
  }
  static subSeconds(date, seconds) {
    return new Date(date.getTime() - seconds * 1000);
  }
  static addMiliSeconds(date, ms) {
    return new Date(date.getTime() + ms);
  }
  static subMiliSeconds(date, ms) {
    return new Date(date.getTime() - ms);
  }
}
