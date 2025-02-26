export default function enums() {
  return {
    scp_keystore_alg: [
      { key: "80", value: "80 - DES - mode (ECB/CBC) implicitly known" },
      { key: "81", value: "81 - Reserved (Triple DES)" },
      { key: "82", value: "82 - Triple DES in CBC mode" },
      { key: "83", value: "83 - DES in ECB mode" },
      { key: "84", value: "84 - DES in CBC mode" },
      { key: "85", value: "85 - Pre-Shared Key for TLS" },
      { key: "88", value: "88 - AES" },
      { key: "90", value: "90 - HMAC-SHA1 - length of HMAC is implicitly known" },
      { key: "91", value: "91 - HMAC-SHA1-160 - length of HMAC is 160 bits" },
      { key: "A0", value: "A0 - RSA Public Key - public exponent e component (clear text)" },
      { key: "A1", value: "A1 - RSA Public Key - modulus N component (clear text)" },
      { key: "A2", value: "A2 - RSA Private Key - modulus N component" },
      { key: "A3", value: "A3 - RSA Private Key - private exponent d component" },
      { key: "A4", value: "A4 - RSA Private Key - Chinese Remainder P component" },
      { key: "A5", value: "A5 - RSA Private Key - Chinese Remainder Q component" },
      { key: "A6", value: "A6 - RSA Private Key - Chinese Remainder PQ component ( q-1 mod p )" },
      { key: "A7", value: "A7 - RSA Private Key - Chinese Remainder DP1 component ( d mod (p-1) )" },
      { key: "A8", value: "A8 - RSA Private Key - Chinese Remainder DQ1 component ( d mod (q-1) )" },
      { key: "FF", value: "FF - Extended format" },
    ],
    flo_meta_type: [
      { key: "string", value: "String" },
      { key: "number", value: "Number" },
      { key: "boolean", value: "Boolean" },
    ],
    code: [
      { key: 0, value: "none" },
      { key: 1, value: "critical" },
      { key: 2, value: "error" },
      { key: 3, value: "warning" },
      { key: 4, value: "info" },
      { key: 5, value: "debug" },
    ],
    apn_mode: [
      { key: "none", value: "None" },
      { key: "android", value: "Android" },
      { key: "apple", value: "Apple" },
      { key: "windows", value: "Windows" },
      { key: "imei", value: "IMEI" },
    ],
    por_mode: [
      { key: "submit_sm", value: "Submit" },
      { key: "deliver_sm", value: "Deliver" },
    ],
    tar: [
      { key: "000000", value: "RAM" },
      { key: "b00010", value: "GSM" },
      { key: "b00001", value: "USIM" },
    ],
    key_type: [
      { key: "tk", value: "TK" },
      { key: "op", value: "OP" },
      { key: "ki", value: "KI" },
      { key: "adm", value: "ADM" },
      { key: "opc", value: "OPC" },
      { key: "kic", value: "KIC" },
      { key: "kid", value: "KID" },
      { key: "dek", value: "DEK" },
      { key: "tlsdek", value: "TLSDEK" },
      { key: "tlspsk", value: "TLSPSK" },
    ],
    status: [
      { key: "active", value: "Active" },
      { key: "delete", value: "Delete" },
    ],
    alg: [
      { key: "aes", value: "AES" },
      { key: "des", value: "DES" },
      { key: "des3", value: "DES3" },
      { key: "psk_tls", value: "PSK_TLS" },
    ],
    scp: [
      { key: "80", value: "SCP80" },
      { key: "81", value: "SCP81" },
    ],
    keyset_scp80: [
      { key: 0, value: "Keyset - First Available" },
      { key: 1, value: "Keyset 1" },
      { key: 2, value: "Keyset 2" },
      { key: 3, value: "Keyset 3" },
      { key: 4, value: "Keyset 4" },
      { key: 5, value: "Keyset 5" },
      { key: 6, value: "Keyset 6" },
      { key: 7, value: "Keyset 7" },
      { key: 8, value: "Keyset 8" },
      { key: 9, value: "Keyset 9" },
      { key: 10, value: "Keyset 10" },
      { key: 11, value: "Keyset 11 - Reserved", disabled: true },
      { key: 12, value: "Keyset 12" },
      { key: 13, value: "Keyset 13" },
      { key: 14, value: "Keyset 14" },
      { key: 15, value: "Keyset 15 - Reserved", disabled: true },
    ],
    keyset_scp81: [
      { key: 0, value: "Keyset - First Available" },
      { key: 64, value: "Keyset 64" },
      { key: 65, value: "Keyset 65" },
      { key: 66, value: "Keyset 66" },
      { key: 67, value: "Keyset 67" },
      { key: 68, value: "Keyset 68" },
      { key: 69, value: "Keyset 69" },
      { key: 70, value: "Keyset 70 - Reserved", disabled: true },
      { key: 71, value: "Keyset 71 - Reserved", disabled: true },
      { key: 72, value: "Keyset 72" },
      { key: 73, value: "Keyset 73 - Reserved", disabled: true },
      { key: 74, value: "Keyset 74 - Reserved", disabled: true },
      { key: 75, value: "Keyset 75 - Reserved", disabled: true },
      { key: 76, value: "Keyset 76" },
      { key: 77, value: "Keyset 77 - Reserved", disabled: true },
    ],
    sms_code: [
      { key: 100, value: 100 },
      { key: 102, value: 102 },
      { key: 199, value: 199 },
      { key: 200, value: 200 },
      { key: 202, value: 202 },
      { key: 400, value: 400 },
      { key: 404, value: 404 },
      { key: 408, value: 408 },
      { key: 499, value: 499 },
      { key: 500, value: 500 },
      { key: 600, value: 600 },
    ],
    sms_mtype: [
      { key: "scp81-exception", value: "SCP81 Exception" },
      { key: "scp81-progress", value: "SCP81 Progress" },
      { key: "scp81-handshake", value: "SCP81 Handshake" },
      { key: "scp80-push-ack", value: "SCP80 Push Ack" },
      { key: "scp80-por", value: "SCP80 POR" },
      { key: "scp80-push-cancel", value: "SCP80 PUSH Cancel" },
      { key: "scp80-rfm-por", value: "SCP80 RFM POR" },
      { key: "scp80-rfm", value: "SCP80 RFM" },
      { key: "scp80-ram", value: "SCP80 RAM" },
      { key: "scp80-push-por", value: "SCP80 PUSH POR" },
      { key: "scp80-ram-por", value: "SCP80 RAM POR" },
      { key: "scp80-push", value: "SCP80 Push" },
      { key: "scp80-applet-flolive", value: "SCP80 Applet FloLive" },
      { key: "scp_expired", value: "SCP Expired" },
      { key: "sms", value: "SMS" },
      { key: "sms_deliver", value: "SMS Deliver" },
      { key: "raw", value: "Raw" },
      { key: "raw_deliver", value: "Raw Deliver" },
      { key: "apn", value: "APN" },
      { key: "apn_deliver", value: "APN Deliver" },
      { key: "location", value: "Location" },
    ],
    logs_mtype: [
      { key: "smscs", value: "SMSC" },
      { key: "bips", value: "BIPS" },
      { key: "hsms", value: "HSMS" },
      { key: "uiccs", value: "UICCS" },
      { key: "uicc_aids", value: "UICC AIDs" },
      { key: "subscribers", value: "Subscribers" },
      { key: "billings", value: "Billings" },
      { key: "registrars", value: "Registrars" },
      { key: "campaigns", value: "Campaigns" },
      { key: "campaign_participants", value: "Campaign Participants" },
      { key: "orders", value: "Orders" },
      { key: "products", value: "Products" },
      { key: "vfdefintion", value: "Virtual File Defintion" },
      { key: "vfile_definitions", value: "Virtual File Defintions" },
      { key: "card", value: "Card" },
      { key: "cards", value: "Cards" },
      { key: "card_vf", value: "Card Virtual Files" },
      { key: "card_settings", value: "Card Settings" },
      { key: "card_subs", value: "Card Subscribers" },
      { key: "rfs", value: "RFS" },
      { key: "applets", value: "Applets" },
      { key: "kafka", value: "Kafka" },
    ],
    logs_msubtype: [
      { key: "connectivity", value: "Connectivity" },
      { key: "campaign", value: "Campaign" },
      { key: "changed", value: "Changed" },
      { key: "scp80-push", value: "SCP80 PUSH" },
      { key: "scp80-ram", value: "SCP80 RAM" },
      { key: "scp81-handshake", value: "SCP81 Handshake" },
      { key: "scp81-progress", value: "SCP81 Progress" },
      { key: "sms-in", value: "SMS In" },
      { key: "sms-out", value: "SMS Out" },
      { key: "location", value: "Location" },
      { key: "scp80-applet-flolive", value: "SCP80 Applet FloLive" },
      { key: "scp80-rfm", value: "SCP80 RFM" },
      { key: "scp80-rfm-por", value: "SCP80 RFM POR" },
      { key: "scp_expired", value: "SCP Expired" },
      { key: "apn-request", value: "APN Request" },
      { key: "command", value: "Command" },
      { key: "suspend", value: "Suspend" },
      { key: "kafka", value: "Kafka" },
      { key: "trigger", value: "Trigger" },
    ],
    alerts_mtype: [
      { key: "smscs", value: "SMSC" },
      { key: "bips", value: "BIPS" },
      { key: "hsms", value: "HSMS" },
      { key: "subscribers", value: "Subscribers" },
      { key: "billings", value: "Billings" },
      { key: "registrars", value: "Registrars" },
      { key: "campaigns", value: "Campaigns" },
      { key: "orders", value: "Orders" },
      { key: "cards", value: "Cards" },
      { key: "card", value: "Card" },
      { key: "kafka", value: "Kafka" },
    ],
    alerts_msubtype: [
      { key: "connectivity", value: "Connectivity" },
      { key: "sms-out", value: "SMS Out" },
      { key: "scp81-handshake", value: "SCP81 Handshake" },
      { key: "location", value: "Location" },
      { key: "imei", value: "IMEI" },
      { key: "process", value: "Process" },
      { key: "command", value: "Command" },
      { key: "suspend", value: "Suspend" },
      { key: "kafka", value: "Kafka" },
      { key: "apn-request", value: "APN Request" },
      { key: "trigger", value: "Trigger" },
    ],
  };
}
