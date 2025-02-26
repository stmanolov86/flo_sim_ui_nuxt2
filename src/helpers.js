export default class Helpers {
  static capitalizeFLetter(input) {
    return input[0].toUpperCase() + input.slice(1);
  }
  static capitalizeAllFLetter(input, del) {
    let split = input.split(del);
    for (let i = 0; i < split.length; i++) {
      split[i] = this.capitalizeFLetter(split[i]);
    }
    return split.join(" ");
  }
  static capitalizeAll(input, del) {
    let split = [];
    for (let i = 0; i < input.length; i++) {
      split[i] = input[i].toUpperCase();
    }
    return split.join(`${del} `);
  }
  static pad(numStr, digits) {
    numStr = numStr.toString();
    while (numStr.length < digits) numStr = "0" + numStr;
    return numStr;
  }
  static padHex(num, digits) {
    let numStr = num.toString(16);

    while (numStr.length < digits) numStr = "0" + numStr;

    return numStr;
  }
  static padEnd(formatted, length) {
    // Find the index of the first non-F character
    let nonFIndex = formatted.search(/[^F]/);

    // If no non-F character is found, pad the entire string
    if (nonFIndex === -1) {
      return formatted.padEnd(length, "F");
    }

    // Calculate the number of characters we can pad
    let padding = Math.max(0, length - formatted.length);

    // Construct the result by padding only if there is room
    let padded = formatted.slice(0, nonFIndex) + formatted.slice(nonFIndex).padEnd(nonFIndex + padding, "F");

    return padded;
  }
  static padAsciiHex(num, digits, pad) {
    let numStr = num.toString(16);

    while (numStr.length < digits) numStr = numStr + pad;

    return numStr;
  }
  static toLocalTimeInIsoFormatUi(ts) {
    let tsDate = new Date(ts);
    return tsDate.getFullYear() + "-" + this.pad(tsDate.getMonth() + 1, 2) + "-" + this.pad(tsDate.getDate(), 2) + " " + this.pad(tsDate.getHours(), 2) + ":" + this.pad(tsDate.getMinutes(), 2) + ":" + this.pad(tsDate.getSeconds(), 2);
  }
  static getTsString(ts) {
    if (!ts) {
      return "";
    }
    return this.toLocalTimeInIsoFormatUi(ts);
  }
  static setDateTime(days) {
    let tsDate = new Date();
    if (days) {
      tsDate.setDate(tsDate.getDate() + days);
    }

    return tsDate.getFullYear() + "-" + this.pad(tsDate.getMonth() + 1, 2) + "-" + this.pad(tsDate.getDate(), 2) + " " + this.pad(tsDate.getHours(), 2) + ":" + this.pad(tsDate.getMinutes(), 2) + ":" + this.pad(tsDate.getSeconds(), 2);
  }
  static toLocalTimeInIsoFormat(ts) {
    let tsDate = new Date(ts);
    return tsDate.getFullYear() + "-" + this.pad(tsDate.getMonth() + 1, 2) + "-" + this.pad(tsDate.getDate(), 2) + "T" + this.pad(tsDate.getHours(), 2) + ":" + this.pad(tsDate.getMinutes(), 2) + ":" + this.pad(tsDate.getSeconds(), 2) + "." + (tsDate.getMilliseconds() / 1000).toFixed(3).slice(2, 5) + "Z";
  }
  static dec2bin(d) {
    let b = "";

    for (let i = 0; i < 8; i++) {
      b = (d % 2) + b;
      d = Math.floor(d / 2);
    }

    return b;
  }
  static createdSince(time, resource, past, present) {
    let f_time = new Date(time).getTime();
    let currentDate = new Date();
    let timeDifference = f_time - currentDate.getTime();

    if (timeDifference <= 0) {
      // The event is in the past or happening now
      if (Math.abs(timeDifference) < 60000) {
        // If the time difference is less than a minute, consider it happening now
        return `${resource} ${present} now.`;
      } else if (Math.abs(timeDifference) < 60 * 60 * 1000) {
        // If the time difference is less than an hour, consider it within the hour
        return `${resource} ${past} less than an hour ago.`;
      } else {
        // Calculate the time units
        let units = [
          { duration: 365 * 24 * 60 * 60 * 1000, text: "year" },
          { duration: 30 * 24 * 60 * 60 * 1000, text: "month" },
          { duration: 24 * 60 * 60 * 1000, text: "day" },
          { duration: 60 * 60 * 1000, text: "hour" },
        ];

        let durationParts = units
          .map(({ duration, text }) => {
            let difference = Math.floor(Math.abs(timeDifference) / duration);
            timeDifference %= duration;
            return difference > 0 ? `${difference} ${text}${difference > 1 ? "s" : ""}` : "";
          })
          .filter(Boolean);

        let durationText = durationParts.join(", ");

        if (timeDifference < 0) {
          return `${resource} ${past} ${durationText ? durationText + " " : ""}ago.`;
        } else {
          return `${resource} ${present} in ${durationText ? durationText + " " : ""}.`;
        }
      }
    } else {
      // The event is in the future
      // Check if it's within a minute
      if (timeDifference < 60000) {
        let secondsDifference = Math.floor(timeDifference / 1000);
        return `${resource} ${present} in ${secondsDifference} second${secondsDifference > 1 ? "s" : ""}.`;
      }
      // Check if it's within an hour
      else if (timeDifference < 60 * 60 * 1000) {
        let minutesDifference = Math.floor(timeDifference / (60 * 1000));
        return `${resource} ${present} in ${minutesDifference} minute${minutesDifference > 1 ? "s" : ""}.`;
      }
      // Check if it's within a day
      else if (timeDifference < 24 * 60 * 60 * 1000) {
        let hoursDifference = Math.floor(timeDifference / (60 * 60 * 1000));
        return `${resource} ${present} in ${hoursDifference} hour${hoursDifference > 1 ? "s" : ""}.`;
      }
      // Check if it's within a week
      else if (timeDifference < 7 * 24 * 60 * 60 * 1000) {
        let daysDifference = Math.floor(timeDifference / (24 * 60 * 60 * 1000));
        let remainingHours = Math.floor((timeDifference % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        return `${resource} ${present} in ${daysDifference} day${daysDifference > 1 ? "s" : ""}, ${remainingHours} hour${remainingHours > 1 ? "s" : ""}.`;
      } else {
        // Calculate the time units for longer durations
        let units = [
          { duration: 365 * 24 * 60 * 60 * 1000, text: "year" },
          { duration: 30 * 24 * 60 * 60 * 1000, text: "month" },
          { duration: 7 * 24 * 60 * 60 * 1000, text: "week" },
        ];

        let durationParts = units
          .map(({ duration, text }) => {
            let difference = Math.floor(timeDifference / duration);
            timeDifference %= duration;
            return difference > 0 ? `${difference} ${text}${difference > 1 ? "s" : ""}` : "";
          })
          .filter(Boolean);

        let durationText = durationParts.join(", ");
        return `${resource} ${present} in ${durationText || durationText + " "}.`;
      }
    }
  }
  static readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file);
    });
  }
  static readFileAsDataURL(file) {
    return new Promise(function (resolve, reject) {
      let reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsDataURL(file);
    });
  }
  static parseCSV(text, delimiter) {
    delimiter = delimiter || ",";
    let nSep = "\x1D"; // ^]	\x1d	1d	29	Group separator
    let qSep = "\x1E"; // ^^	\x1e	1e	30	Record separator
    let cSep = "\x1F"; // ^-	\x1f	1f	31	Unit separator
    let nSepRe = new RegExp(nSep, "g");
    let qSepRe = new RegExp(qSep, "g");
    let cSepRe = new RegExp(cSep, "g");
    let fieldRe = new RegExp("(?<=(^|[" + delimiter + '\\n]))"(|[\\s\\S]+?(?<![^"]"))"(?=($|[' + delimiter + "\\n]))", "g");
    let csv = [];
    text
      .replace(/\r/g, "")
      .replace(/\n+$/, "")
      .replace(fieldRe, function (match, p1, p2) {
        return p2.replace(/\n/g, nSep).replace(/""/g, qSep).replace(/,/g, cSep);
      })
      .split(/\n/)
      .forEach(function (line) {
        let row = line.split(delimiter).map(function (cell) {
          return cell.replace(nSepRe, "\n").replace(qSepRe, '"').replace(cSepRe, ",");
        });
        csv = row;
      });

    return csv;
  }
  static parseTLV(hexStr) {
    let idx = 0;
    let tlv = [];

    while (idx < hexStr.length) {
      // Parse the Tag (T)
      let tag = hexStr.slice(idx, idx + 2);
      idx += 2;

      // If tag is 'FF', continue to next entry
      if (tag === "FF") {
        continue;
      }

      // Parse the Length (L)
      let lengthHex = hexStr.slice(idx, idx + 2);
      let length = parseInt(lengthHex, 16);
      idx += 2;

      // If lengthHex is 'FF', continue to next entry
      if (lengthHex === "FF") {
        continue;
      }

      // Parse the Value (V)
      let value = hexStr.slice(idx, idx + length * 2);
      idx += length * 2;

      // If value starts with 'FF', ignore this entry
      if (value.startsWith("FF")) {
        continue;
      }

      tlv.push({
        tag: tag,
        length: length,
        value: value,
      });
    }

    return tlv;
  }
  static stringifyTLV(tlvArray) {
    let hexStr = "";
    for (const tlv of tlvArray) {
      hexStr += tlv.tag + tlv.length.toString(16).padStart(2, "0").toUpperCase() + tlv.value;
    }
    return hexStr;
  }
  static parseUCS2toTLV(hexStr) {
    let idx = 0;
    let tlv = [];

    while (idx < hexStr.length) {
      // Parse the Tag (T)
      let tag = hexStr.slice(idx, idx + 2);
      idx += 2;

      // If tag is 'FF', continue to next entry
      if (tag === "FF") {
        continue;
      }

      // Parse the Length (L)
      let lengthHex = hexStr.slice(idx, idx + 2);
      let length = parseInt(lengthHex, 16);
      idx += 2;

      // If lengthHex is 'FF', continue to next entry
      if (lengthHex === "FF") {
        continue;
      }

      // Parse the Coding Scheme
      let codingScheme = hexStr.slice(idx, idx + 2);
      idx += 2;

      // If codingScheme is 'FF', continue to next entry
      if (codingScheme === "FF") {
        continue;
      }

      // Only process if codingScheme is '10' (UCS2 16-bit coding)
      if (codingScheme !== "10") {
        continue;
      }

      // Parse the Value (V)
      let valueHex = hexStr.slice(idx, idx + (length - 1) * 2); // length - 1 because 1 byte is used for codingScheme
      idx += (length - 1) * 2;

      // If value starts with 'FF', ignore this entry
      if (valueHex.startsWith("FF")) {
        continue;
      }

      // Decode UCS2 Value
      let value = "";
      for (let i = 0; i < valueHex.length; i += 4) {
        let codePoint = parseInt(valueHex.slice(i, i + 4), 16);
        value += String.fromCharCode(codePoint);
      }

      tlv.push({
        tag: tag,
        length: length,
        codingScheme: codingScheme,
        value: value,
      });
    }

    return tlv;
  }
  static CSVtoArray(text) {
    let re_valid = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
    let re_value = /(?!\s*$)\s*(?:'([^'\\]*(?:\\[\S\s][^'\\]*)*)'|"([^"\\]*(?:\\[\S\s][^"\\]*)*)"|([^,'"\s\\]*(?:\s+[^,'"\s\\]+)*))\s*(?:,|$)/g;
    if (!re_valid.test(text)) return null;
    let a = [];
    text.replace(
      re_value, // "Walk" the string using replace with callback.
      function (m0, m1, m2, m3) {
        // Remove backslash from \' in single quoted values.
        if (m1 !== undefined) a.push(m1.replace(/\\'/g, "'"));
        // Remove backslash from \" in double quoted values.
        else if (m2 !== undefined) a.push(m2.replace(/\\"/g, '"'));
        else if (m3 !== undefined) a.push(m3);
        return ""; // Return empty string.
      },
    );

    // Handle special case of empty last value.
    if (/,\s*$/.test(text)) a.push("");
    return a;
  }
  static JSONToXSV(json, delimiter) {
    let l_delimiter = delimiter ? delimiter : ",";
    let arr = typeof json !== "object" ? JSON.parse(json) : json;
    let str =
      `${Object.keys(arr[0])
        .map((value) => `"${value}"`)
        .join(l_delimiter)}` + "\r\n";

    let csvContent = arr.reduce((st, next) => {
      st +=
        `${Object.values(next)
          .map((value) => (typeof value == "string" ? `"${value}"` : value))
          .join(l_delimiter)}` + "\r\n";
      return st;
    }, str);

    return csvContent;
  }
  static decodeUnit(unit) {
    switch (unit) {
      case "d":
        return 0.1;
      case "m":
        return 0.001;
      case "n":
        return 0.000000001;
      case "K":
        return 1000;
      case "M":
        return 1000 * 1000;
      case "G":
        return 1000 * 1000 * 1000;
      case "T":
        return 1000 * 1000 * 1000 * 1000;
      case "P":
        return 1000 * 1000 * 1000 * 1000 * 1000;
      case "E":
        return 1000 * 1000 * 1000 * 1000 * 1000 * 1000;
      case "Ki":
        return 1024;
      case "Mi":
        return 1024 * 1024;
      case "Gi":
        return 1024 * 1024 * 1024;
      case "Ti":
        return 1024 * 1024 * 1024 * 1024;
      case "Pi":
        return 1024 * 1024 * 1024 * 1024 * 1024;
      case "Ei":
        return 1024 * 1024 * 1024 * 1024 * 1024 * 1024;
      default:
        return 1;
    }
  }
  static decodeValue(str_value) {
    let arr = str_value.split("");
    let digits = "";
    let unit = "";

    for (let i = 0; i < arr.length; i++) {
      const c = arr[i];
      if (c >= 0 && c <= 9) {
        digits += c.toString();
      } else {
        unit += c.toString();
      }
    }

    if (!unit) {
      return parseInt(digits);
    } else {
      return parseInt(digits) * this.decodeUnit(unit);
    }
  }
  static decodeMemoryToMi(value) {
    let luni = this.decodeValue(value);
    if (luni == 0) {
      return 0;
    }
    return Math.round(luni / (1024 * 1024));
  }
  static decodeMemoryToUnit(value, unit) {
    let luni = this.decodeValue(value);
    if (luni == 0) {
      return 0;
    }
    return Math.round(luni / this.decodeUnit(unit));
  }
  static decodeCpuTom(value) {
    let luni = this.decodeValue(value);
    if (luni == 0) {
      return 0;
    }

    let backTom = Math.round(luni / 0.001);
    return backTom;
  }
  static decodeCpuToUnit(value, unit) {
    let luni = this.decodeValue(value);
    if (luni == 0) {
      return 0;
    }
    let backToUnit = Math.round(luni / this.decodeUnit(unit));
    return backToUnit;
  }
  static toBinary(string) {
    const codeUnits = new Uint16Array(string.length);
    for (let i = 0; i < codeUnits.length; i++) {
      codeUnits[i] = string.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
  }
  static fromBinary(binary) {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return String.fromCharCode(...new Uint16Array(bytes.buffer));
  }
  static formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
  }
  static formatString(input) {
    // Format a given string as follows: replace _ OR " " with " " & capitalize the first letter of every word
    let i,
      result = input.includes("_") ? input.split("_") : input.split(" ");
    for (i = 0; i < result.length; i++) {
      result[i] = result[i].toLowerCase();
      result[i] = result[i].charAt(0).toUpperCase() + result[i].slice(1);
    }
    return result.join(" ");
  }
  static abbreviateNumber(number) {
    let postfixes = ["", "K", "M", "G", "T", "P", "E"];
    let sign = number < 0 ? "-1" : "";
    let absNumber = Math.abs(number);
    let tier = (Math.log10(absNumber) / 3) | 0;

    // if zero, we don't need a prefix
    if (tier == 0) return `${absNumber}`;

    // get postfix and determine scale
    let postfix = postfixes[tier];
    let scale = Math.pow(10, tier * 3);

    // scale the number
    let scaled = absNumber / scale;
    let floored = Math.floor(scaled * 10) / 10;

    // format number and add postfix as suffix
    let str = floored.toFixed(1);

    // remove '.0' case
    str = /\.0$/.test(str) ? str.substr(0, str.length - 2) : str;
    return `${sign}${str}${postfix}`;
  }
  static getQATag(resources, header) {
    return `dialog@${resources.toLowerCase()}@${header.value}`;
  }
  static isEqual(a, b) {
    // Perform shallow or deep comparison between two values (numbers, strings, booleans, null, undefined, & objects) to determine equality.
    if (a === b) return true;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (!a || !b || (typeof a !== "object" && typeof b !== "object")) return a === b;
    if (a === null || a === undefined || b === null || b === undefined) return false;
    if (a.prototype !== b.prototype) return false;
    let keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    return keys.every((k) => this.isEqual(a[k], b[k]));
  }
  static formatTime(input) {
    // Format input to HH:MM:SS
    let formattedInput = input.replace(/\D/g, "").padStart(6, "0");
    let [hours, minutes, seconds] = [0, 2, 4].map((i) => formattedInput.slice(i, i + 2));
    return `${hours}:${minutes}:${seconds}`;
  }
  static secondsToTime(seconds) {
    // Format seconds to MM:DD:HH:MM:SS
    let secondsInMinute = 60;
    let secondsInHour = 3600;
    let secondsInDay = 86400;
    let secondsInMonth = 2592000;
    let secondsInYear = 31536000;

    let years = Math.floor(seconds / secondsInYear);
    seconds -= years * secondsInYear;
    let months = Math.floor(seconds / secondsInMonth);
    seconds -= months * secondsInMonth;
    let days = Math.floor(seconds / secondsInDay);
    seconds -= days * secondsInDay;
    let hours = Math.floor(seconds / secondsInHour);
    seconds -= hours * secondsInHour;
    let minutes = Math.floor(seconds / secondsInMinute);
    seconds -= minutes * secondsInMinute;
    let result = "";

    if (years > 0) {
      result += `${years} year${years > 1 ? "s" : ""}, `;
    }
    if (months > 0) {
      result += `${months} month${months > 1 ? "s" : ""}, `;
    }
    if (days > 0) {
      result += `${days} day${days > 1 ? "s" : ""}, `;
    }
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? "s" : ""}, `;
    }
    if (minutes > 0) {
      result += `${minutes} minute${minutes > 1 ? "s" : ""}, `;
    }
    if (seconds > 0) {
      result += `${seconds} second${seconds > 1 ? "s" : ""}, `;
    }

    return result.slice(0, -2);
  }
  static hexToIp(hex) {
    let pattern = new RegExp(/^[0-9A-Fa-f]*$/);
    let valid = pattern.test(hex);

    if (valid) {
      // Split the HEX string into four two-character chunks, convert each chunk to decimal & build the IP address
      let ip = hex
        .match(/.{1,2}/g)
        .map((m) => parseInt(m, 16))
        .join(".");

      return ip;
    } else {
      return hex;
    }
  }
  static ipToHex(ip) {
    let pattern = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(\/(3[0-2]|[1-2][0-9]|[0-9]))?$|^(([a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4})(\/(12[0-8]|1[0-1][0-9]|[1-9][0-9]|[0-9]))?$/);
    let valid = pattern.test(ip);

    if (valid) {
      // Split the IP address into four decimal numbers, convert each number to hexadecimal & build the HEX string
      let hex = ip
        .split(".")
        .map((m) => parseInt(m).toString(16).padStart(2, "0").toUpperCase())
        .join("");

      return hex;
    } else {
      return ip;
    }
  }
  static hexStringToByteArray(hexString) {
    if (hexString.length % 2 !== 0) {
      return "Invalid HEX string length.";
    }
    let byteArray = [];
    for (let i = 0; i < hexString.length; i += 2) {
      byteArray.push(parseInt(hexString.substring(i, i + 2), 16));
    }
    return byteArray;
  }
  static byteArrayToHexString(byteArray) {
    return byteArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
  }
  static hexAscToAsc(hexAscii) {
    if (hexAscii.length % 2 !== 0) {
      return;
    }

    // Convert HEX ASCII to ASCII
    let ascii = Buffer.from(hexAscii, "hex").toString();
    return ascii;
  }
  static ascToHexAsc(ascii) {
    // Convert ASCII to HEX
    let buffer = Buffer.from(ascii);
    return buffer.toString("hex").toUpperCase();
  }
  static ascToBcdAsc(ascii) {
    if (0 != ascii.length % 2) {
      return ascii + "F";
    }
    return ascii;
  }
  static ascToBytes(str) {
    // Convert string to an array of ASCII values
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
  static bcdAscToAsc(bcdAscii) {
    if (bcdAscii.length == 0) {
      return bcdAscii;
    }

    if ("F" == bcdAscii.substr(bcdAscii.length - 1)) {
      return bcdAscii.substr(0, bcdAscii.length - 1);
    }

    return bcdAscii;
  }
  static hexAscToUi(str) {
    let result = [];
    let idx = 0;

    while (idx < str.length) {
      if (/^F+$/.test(str.substr(idx))) {
        break;
      }

      // Read the length of the next part (first two characters)
      let lengthHex = str.substr(idx, 2);
      let length = parseInt(lengthHex, 16);
      idx += 2;

      // Read the corresponding hex characters based on the length
      let hexPart = str.substr(idx, length * 2);
      let asciiPart = this.hexAscToAsc(hexPart);
      result.push(asciiPart);

      // Move the index forward
      idx += length * 2;
    }

    return result.join(".");
  }
  static uiToHexAsc(str) {
    let parts = str.split(".");

    // Convert each part to HEX with the length in front
    let converted = parts.map((part) => {
      let hex = this.ascToHexAsc(part);
      let length = this.calculateHexLength(hex);
      return this.padHex(length, 2) + hex;
    });

    return converted.join("");
  }
  static uiToHexLen(str) {
    // Convert to HEX
    let hexString = this.uiToHexAsc(str);
    let length = hexString.length / 2;
    // Add length (in HEX) as a prefix
    return this.padHex(length, 2) + hexString;
  }
  static uiToAcsiiHex(str) {
    let ascToHexAsc = this.ascToHexAsc(str);
    let length = ascToHexAsc.length / 2;
    return this.padHex(length, 2) + ascToHexAsc + "F".repeat(Math.max(0, (16 - length) * 2));
  }
  static asciiHexToUi(str) {
    if ("" == str) {
      return str;
    }

    if (str.length < 4) {
      return "";
    }

    let len = parseInt(str.substr(0, 2), 16);
    if (len * 2 > str.length - 2) {
      return "";
    }

    let asciiHex = str.substr(2, len * 2);
    return this.hexAscToAsc(asciiHex);
  }
  static bcdAsciiHexToUi(lenBcdHex) {
    if ("" == lenBcdHex) {
      return lenBcdHex;
    }

    if (lenBcdHex.length < 4) {
      return "";
    }

    let len = parseInt(lenBcdHex.substr(0, 2), 16);
    if (len * 2 > lenBcdHex.length - 2) {
      return "";
    }
    let bcdHex = lenBcdHex.substr(2, len * 2);
    return this.bcdAscToAsc(bcdHex);
  }
  static hexToAsciiPadded(hex) {
    let pattern = new RegExp(/^[0-9A-Fa-f]*$/);
    let valid = pattern.test(hex);

    if (valid) {
      // Convert HEX to ASCII by creating a new buffer object from a substring of the HEX and transforming it to ASCII encoding.
      let ascii = Buffer.from(hex.substr(2, hex.substr(0, 2) * 2), "hex").toString();

      return ascii;
    } else {
      return hex;
    }
  }
  static asciiToHexPadded(ascii, length) {
    let pattern = new RegExp(/^[ -~]+$/);
    let valid = pattern.test(ascii);

    if (valid) {
      // Create a new buffer from the length of the ASCII, the ASCII itself, and the remaining bytes are filled with 0xff, and then converted to HEX.
      let hex = Buffer.concat([Buffer.from([ascii.length]), Buffer.from(ascii), Buffer.alloc(length - ascii.length, 0xff)])
        .toString("hex")
        .toUpperCase();

      return hex;
    } else {
      return ascii;
    }
  }
  static asciiToBcdHexPadded(ascii, length) {
    let l_out = "";
    let bcd_len = Math.ceil(ascii.length / 2);
    let bc_len_ascii_hex = this.padHex(bcd_len, 2);
    l_out = bc_len_ascii_hex;

    if (ascii.length % 2 != 0) {
      ascii = ascii + "F";
    }

    l_out = l_out + ascii;

    if (l_out.length < length) {
      l_out = l_out + "F".repeat((length - l_out.length) * 2);
    }

    return l_out;
  }
  static unpackSevenBit(byteArray) {
    let output = "";
    let carryOverBits = 0; // Keeps track of how many bits we've used from the current byte
    let carryOver = 0; // To store bits that spill over

    for (let i = 0; i < byteArray.length; i++) {
      // Get the current byte and shift it left by the number of carryOverBits (to account for spill)
      let currentByte = byteArray[i] & 0xff; // Mask the byte to 8 bits

      // Combine with the leftover bits from the previous byte to form a 7-bit character
      let charCode = ((currentByte << carryOverBits) & 0x7f) | carryOver;

      // Append the decoded character
      output += String.fromCharCode(charCode);

      // Calculate how many bits are carried over to the next byte
      carryOver = (currentByte >> (7 - carryOverBits)) & 0x7f;
      carryOverBits = (carryOverBits + 1) % 8;

      // If we have enough bits carried over to form a full character, add it
      if (carryOverBits === 7) {
        output += String.fromCharCode(carryOver);
        carryOverBits = 0;
        carryOver = 0; // Reset carryOver
      }
    }

    return output;
  }
  static packSevenBit(inputString) {
    const byteArray = [];
    let buffer = 0;
    let bufferBits = 0;

    for (let i = 0; i < inputString.length; i++) {
      // Get the 7-bit value of the current character
      let charCode = inputString.charCodeAt(i) & 0x7f; // Mask the character to 7 bits

      // Add the character's bits to the buffer
      buffer |= charCode << bufferBits;
      bufferBits += 7;

      // While there are at least 8 bits in the buffer, extract a byte
      while (bufferBits >= 8) {
        byteArray.push(buffer & 0xff); // Store the lowest 8 bits
        buffer >>= 8; // Shift right by 8 bits to process the next byte
        bufferBits -= 8;
      }
    }

    // If there are remaining bits in the buffer, add them as a final byte
    if (bufferBits > 0) {
      byteArray.push(buffer & 0xff);
    }

    return byteArray;
  }
  static calculateHexLength(inputString) {
    if (!/^[0-9A-Fa-f]*$/.test(inputString)) {
      return "Invalid HEX string.";
    }

    // Calculate byte length
    let length = Math.ceil(inputString.length / 2);

    // Convert length to hex and pad with 0 if needed
    let lengthHex = length.toString(16).toUpperCase();
    if (lengthHex.length === 1) {
      // Ensure length is always two hex digits
      lengthHex = "0" + lengthHex;
    }

    return lengthHex;
  }
  static utf8ToUtf16BEBytes(utf8String) {
    // Convert the UTF-8 string to UTF-16 code units (JS uses UTF-16 internally)
    let utf16CodeUnits = Array.from(utf8String, (char) => char.charCodeAt(0));

    // Create a buffer for UTF-16 Big Endian encoding
    let utf16BE = new Uint8Array(utf16CodeUnits.length * 2);

    for (let i = 0; i < utf16CodeUnits.length; i++) {
      let code = utf16CodeUnits[i];
      utf16BE[i * 2] = (code >> 8) & 0xff; // High byte
      utf16BE[i * 2 + 1] = code & 0xff; // Low byte
    }

    return [...utf16BE];
  }
  static utf16BEBytesToUtf8(utf16BEBytes) {
    let utf16CodeUnits = [];

    for (let i = 0; i < utf16BEBytes.length; i += 2) {
      let highByte = utf16BEBytes[i];
      let lowByte = utf16BEBytes[i + 1];
      let code = (highByte << 8) | lowByte; // Combine bytes into UTF-16 code unit
      utf16CodeUnits.push(code);
    }

    // Convert UTF-16 code units back to a UTF-8 string
    return String.fromCharCode(...utf16CodeUnits);
  }
}
