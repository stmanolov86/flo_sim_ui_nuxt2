<template>
  <div class="flo-time-range">
    <v-container fluid class="ma-0 pa-0">
      <v-row no-gutters>
        <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="px-1">
          <v-select :value="timeRange" @change="onTimeChange($event)" :items="timeRanges" item-text="value" item-value="key" dense hide-details></v-select>
        </v-col>

        <template v-if="timeRange == 'between'">
          <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="px-1">
            <VueCtkDateTimePicker v-model="startTime" @input="onStartTimeChange($event)" label="Start Time" output-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" right no-value-to-custom-elem no-button-now :color="$vuetify.theme.currentTheme.primary" :dark="$vuetify.theme.dark ? true : false">
              <v-text-field v-model="startTime" label="Start Time" dense hide-details></v-text-field>
            </VueCtkDateTimePicker>
          </v-col>
          <v-col :cols="$vuetify.breakpoint.xs ? 12 : 'auto'" class="px-1">
            <VueCtkDateTimePicker v-model="endTime" @input="onEndTimeChange($event)" label="End Time" output-format="YYYY-MM-DD HH:mm:ss" format="YYYY-MM-DD HH:mm:ss" right no-value-to-custom-elem no-button-now :color="$vuetify.theme.currentTheme.primary" :dark="$vuetify.theme.dark ? true : false">
              <v-text-field v-model="endTime" label="End Time" dense hide-details></v-text-field>
            </VueCtkDateTimePicker>
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import DateUtils from "~/src/dateUtils.js";
export default {
  name: "flo-time-range",
  data() {
    return {
      startTime: "",
      endTime: "",
      timeRange: "",
      timeRanges: [
        { key: "lastFifteenMinutes", value: "Last 15 Min" },
        { key: "lastHour", value: "Last Hour" },
        { key: "lastDay", value: "Last Day" },
        { key: "between", value: "Between Dates" },
      ],
    };
  },
  props: {
    value: {
      type: String,
      required: false,
      default: "lastHour",
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      this.onTimeChange(this.value);
    },
    onTimeChange(event) {
      this.timeRange = event;
      this.startTime = "";
      this.endTime = "";
      let l_sts = new Date();
      // Time displayed here is in UI format - user TZ
      let l_time_range = {
        // convert a date object - to UI format and keep the user TZ
      };

      switch (event) {
        case "lastFifteenMinutes":
          l_sts = DateUtils.subMinutes(l_sts, 15);
          l_time_range["startTime"] = DateUtils.localToLocalLikeIso(l_sts);
          break;
        case "lastHour":
          l_sts = DateUtils.subMinutes(l_sts, 60);
          l_time_range["startTime"] = DateUtils.localToLocalLikeIso(l_sts);
          break;
        case "lastDay":
          l_sts = DateUtils.subMinutes(l_sts, 1440);
          l_time_range["startTime"] = DateUtils.localToLocalLikeIso(l_sts);
          break;
        case "between":
          break;
      }
      console.log(`flo-time-range - onTimeChange - time_range: ${JSON.stringify(l_time_range)}`);
      this.$emit("onTimeChange", l_time_range);
    },
    onStartTimeChange(event) {
      console.log(`flo-time-range - onStartTimeChange - event - ${JSON.stringify(event)}`);
      this.$emit("onStartTimeChange", event);
    },
    onEndTimeChange(event) {
      console.log(`flo-time-range - onEndTimeChange - event - ${JSON.stringify(event)}`);
      this.$emit("onEndTimeChange", event);
    },
  },
};
</script>
