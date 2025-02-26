<template>
  <v-container fluid class="floTimelineStats ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <v-card :loading="loading" flat :outlined="outlined" class="mx-auto ma-0 pa-0">
          <v-container v-if="!loading" fluid class="ma-0 pa-0">
            <v-row no-gutters>
              <v-col cols="6" class="ma-1 pa-1 mb-0 pb-0">
                <span class="title font-weight-regular text-capitalize ma-0 pa-0">{{ title }}</span>
              </v-col>
            </v-row>
            <slot name="filter"></slot>
            <v-row no-gutters>
              <v-col class="ma-1 pa-1 mt-0 pt-0 mb-0 pb-0">
                <v-breadcrumbs class="ma-0 pa-0" :items="getBreadCrumb()">
                  <template v-slot:item="{ item }">
                    <span v-if="isError(item.text)" class="subtitle-1 error--text">{{ item.text }}</span>
                    <span v-else class="subtitle-1">{{ item.text }}</span>
                  </template>
                  <template v-slot:divider>
                    <v-icon class="ma-0 pa-0">mdi-forward</v-icon>
                  </template>
                </v-breadcrumbs>
              </v-col>
            </v-row>
          </v-container>
          <v-card-text class="ma-0 pa-0">
            <v-card flat>
              <v-row no-gutters>
                <v-col><floTimeline :chart="chartSetup" :y_axis_name="y_axis_name" :x_axis_name="x_axis_name" :min-height="minHeight" :max-height="maxHeight" :unique="unique" :livePastSeconds="livePastSeconds" :update="redrawTheChart" :live="live" @diggIn="diggIn($event)" @diggOut="diggOut($event)" @new-series="newSeries($event)" /> </v-col>
              </v-row>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { max as d3_max } from "d3-array";
import helpers from "~/src/helpers.js";
import DateUtils from "~/src/dateUtils.js";
import floTimeline from "~/components/charts/floTimeline";
export default {
  name: "floTimelineStats",
  data: () => ({
    digg: [],
    stream_state: "end",
    redrawTheChart: 1,
    redraw_in_progress: false,
    postponedDrawId: null,
    postponedDrawIdExtends: 0,
    livePastSeconds: 60 * 25,
    liveEndTs: "1970-01-01 00:00:00",
    loading: true,
    diggIdx: 0,
    records: null,
    chartSetup: {
      type: "bar",
      groupBy: [],
      area: {
        margin: { left: 100, bottom: 70, right: 30, top: 15 },
      },
      axis: {
        x: {
          valueBy: "odate",
          label: {
            name: "Time",
            pad: 40,
          },
          min: 0,
          max: 0,
          tick: {
            count: 10,
            size: 10,
            inner: 5,
            outer: 10,
            pad: 10,
            resolution: "toStartOfThirtySecond",
          },
        },
        y: {
          valueBy: "",
          label: {
            name: "",
            pad: 0,
          },
          min: 0,
          max: 100,
          tick: {
            count: 10,
            size: 10,
            inner: 5,
            outer: 10,
            pad: 10,
          },
        },
      },
      data: [],
      series: [],
    },
  }),
  components: {
    floTimeline,
  },
  props: {
    title: {
      type: String,
      required: false,
      default: "",
    },
    unique: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: false,
      default: "bar",
    },
    l1: {
      type: String,
      required: false,
      default: null,
    },
    l2: {
      type: String,
      required: false,
      default: null,
    },
    resolution: {
      type: String,
      required: false,
      default: "toStartOfThirtySecond",
    },
    aggregate: {
      type: String,
      required: false,
      default: "max",
    },
    live: {
      type: Boolean,
      required: false,
      default: false,
    },
    outlined: {
      type: Boolean,
      required: false,
      default: true,
    },
    minHeight: {
      type: String,
      required: false,
      default: "440px",
    },
    maxHeight: {
      type: String,
      required: false,
      default: "440px",
    },
    groupby: {
      type: Array,
      required: true,
    },
    where: {
      type: Array,
      required: true,
    },
    levels: {
      type: Array,
      required: false,
      default: () => [],
    },
    values: {
      type: Array,
      required: false,
      default: () => [],
    },
    y_axis_name: {
      type: String,
      required: false,
      default: "Items",
    },
    x_axis_name: {
      type: String,
      required: false,
      default: "Time",
    },
    x_value_by: {
      type: String,
      required: false,
      default: "odate",
    },
    y_value_by: {
      type: String,
      required: false,
      default: "value",
    },
  },
  watch: {
    type: function (n) {
      this.chartSetup.type = n;
      this.redrawTheChart++;
    },
    resolution: function (n) {
      this.chartSetup.axis.x.tick.resolution = n;
      this.reloadData();
    },
    aggregate: function () {
      this.reloadData();
    },
    x_axis_name: function (n) {
      this.chartSetup.axis.x.label.name = n;
      this.reloadData();
    },
    y_axis_name: function (n) {
      this.chartSetup.axis.y.label.name = n;
      this.reloadData();
    },
    values: function () {
      this.reloadData();
    },
  },
  methods: {
    isError(text) {
      if (text.toLowerCase().indexOf("error") > -1) {
        return true;
      }

      return false;
    },
    chUtcToIsoUtc(chUtc) {
      return `${chUtc}.00Z`;
    },
    chUtcToLocalDate(chUtc) {
      return new Date(this.chUtcToIsoUtc(chUtc));
    },
    chUtcToIsoUtcZ(chUtc) {
      return `${chUtc}Z`;
    },
    chUtcToLocalDateZ(chUtc) {
      return new Date(this.chUtcToIsoUtcZ(chUtc));
    },
    localLikeIsoToLocalDate(localStr) {
      return new Date(localStr);
    },
    localLikeIsoToChIso(localStr) {
      let temp = this.localLikeIsoToLocalDate(localStr);

      let isoTemp = temp.toISOString();

      isoTemp = isoTemp.replace("T", " ");
      isoTemp = isoTemp.slice(0, -5);

      return isoTemp;
    },
    localToLocalLikeIso(ts) {
      let tsDate = ts;

      return tsDate.getFullYear() + "-" + helpers.pad(tsDate.getMonth() + 1, 2) + "-" + helpers.pad(tsDate.getDate(), 2) + " " + helpers.pad(tsDate.getHours(), 2) + ":" + helpers.pad(tsDate.getMinutes(), 2) + ":" + helpers.pad(tsDate.getSeconds(), 2);
    },
    newSeries(series) {
      let gby = this.getQueryGroupBy();
      series.niceName = this.getNiceGroupValue(gby, series.name);

      let color = series.style.fill;
      color = this.getNiceGroupValueColor(gby, series.name, color);
      series.style.fill = color;
      series.style.stroke = color;
    },
    diggIn(event) {
      if (this.diggIdx < this.digg.length) {
        let cdigg = this.digg[this.diggIdx];
        let egby = event[cdigg.gby];
        cdigg.where.v = egby;

        if (this.diggIdx < this.digg.length - 1) {
          this.diggIdx++;
        }
        this.reloadData();
      }
    },
    diggOut() {
      if (this.diggIdx > 0) {
        this.digg[this.diggIdx].where.v = null;
        this.diggIdx--;
        this.digg[this.diggIdx].where.v = null;
        this.reloadData();
      } else if (this.diggIdx == 0) {
        this.digg[this.diggIdx].where.v = null;
        this.reloadData();
      }
    },
    getNiceGroup(g) {
      let l_levels = this.levels;
      let l_level = l_levels.find((f) => f.key == g);
      if (!l_level) {
        return g;
      }

      return l_level.name;
    },
    getNiceGroupValue(g, v) {
      let lg = `${g}`;
      switch (lg.toLowerCase()) {
        default: {
          return v;
        }
      }
    },
    getNiceGroupValueColor(g, v, c) {
      let lg = `${g}`;
      switch (lg.toLowerCase()) {
        case "gid": {
          return c;
        }
        case "app": {
          return c;
        }
        case "cat": {
          return c;
        }
        case "sub": {
          switch (v.toLowerCase()) {
            case "requests": {
              return this.$vuetify.theme.currentTheme.info;
            }
            case "results": {
              return this.$vuetify.theme.currentTheme.success;
            }
            case "errors": {
              return this.$vuetify.theme.currentTheme.error;
            }
          }

          return c;
        }
        case "name": {
          return c;
        }
        default: {
          return c;
        }
      }
    },
    getBreadCrumb() {
      let bc = [];
      if (this.digg.length == 0) {
        return bc;
      }

      for (let i = 0; i <= this.diggIdx; i++) {
        const c = this.digg[i];
        let bit = "";
        if (i === 0) {
          bit = "By ";
        }

        if (!c.where.v) {
          bit += this.getNiceGroup(c.gby);
          bc.push({ text: `${bit}`, disabled: false });
        } else {
          bit += `${this.getNiceGroup(c.gby)} (${this.getNiceGroupValue(c.gby, c.where.v)})`;
          bc.push({ text: `${bit}`, disabled: false });
        }
      }

      return bc;
    },

    getQueryGroupBy() {
      let gby = [this.digg[this.diggIdx].gby];
      return gby;
    },
    getQueryWhere() {
      let where = [];

      // push init were
      for (let i = 0; i < this.where.length; i++) {
        const w = this.where[i];
        where.push(w);
      }

      if (this.l1) {
        where.push([{ k: "l1", op: "=", v: this.l1 }]);
      }
      if (this.l2) {
        where.push([{ k: "l2", op: "=", v: this.l2 }]);
      }

      for (let i = 0; i <= this.diggIdx; i++) {
        const d = this.digg[i];
        if (d.where.v) {
          where.push([d.where]);
        }
      }

      return where;
    },
    postponedDraw(max_extend) {
      if (this.postponedDrawId != null) {
        if (max_extend < this.postponedDrawIdExtends) {
          clearTimeout(this.postponedDrawId);
          this.postponedDrawIdExtends++;
        } else {
          return;
        }
      }

      this.postponedDrawId = setTimeout(() => {
        this.redrawChart();
        this.postponedDrawId = null;
        this.postponedDrawIdExtends = 0;
      }, 500);
    },
    async reloadData() {
      // console.log(`floTimelineStats:reloadData - enter`);
      let l_values = this.values;
      let l_transformed = [];
      // transform fields
      // console.log(`floTimelineStats:reloadData - values: ${JSON.stringify(l_values)}`);
      // console.log(`floTimelineStats:reloadData - this.aggregate: ${JSON.stringify(this.aggregate)}`);
      l_transformed = l_values.map((m) => {
        let o = {};

        o[this.aggregate] = m[this.y_value_by];
        o[this.chartSetup.axis.x.valueBy] = this.chUtcToLocalDateZ(m[this.x_value_by]);

        let l_levels = this.levels;
        for (let i = 0; i < l_levels.length; i++) {
          const level = l_levels[i];
          o[level.key] = m[level.field];
        }

        return o;
      });

      // console.log(`floTimelineStats:reloadData - map l_transformed: ${JSON.stringify(l_transformed)}`);

      // filter
      let where = this.getQueryWhere();
      // console.log(`floTimelineStats:reloadData - where: ${JSON.stringify(where)}`);
      for (let wi = 0; wi < where.length; wi++) {
        const wo = where[wi];
        for (let wii = 0; wii < wo.length; wii++) {
          const woo = wo[wii];
          l_transformed = l_transformed.filter((f) => f[woo.k] == woo.v);
        }
      }

      // console.log(`floTimelineStats:reloadData - filter l_transformed: ${JSON.stringify(l_transformed)}`);

      let l_group_by = this.getQueryGroupBy();
      this.chartSetup.groupBy = l_group_by;

      // console.log(`floTimelineStats:reloadData - l_group_by: ${JSON.stringify(l_group_by)}`);

      // remove unused fields
      l_transformed = l_transformed.map((m) => {
        let r = {};
        r[this.aggregate] = m[this.aggregate];
        r["odate"] = m["odate"];

        for (let gi = 0; gi < l_group_by.length; gi++) {
          const gobj = l_group_by[gi];
          r[gobj] = m[gobj];
        }

        return r;
      });

      // console.log(`floTimelineStats:reloadData - remove fields l_transformed: ${JSON.stringify(l_transformed)}`);
      // console.log(`floTimelineStats:reloadData - this.aggregate: ${JSON.stringify(this.aggregate)}`);

      // reduce by group and aggregate
      l_transformed = l_transformed.reduce((pv, cv) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }

        let found = l_pv.find((f) => {
          if (l_group_by.length == 0) {
            return false;
          }

          if (f["odate"].valueOf() != cv["odate"].valueOf()) {
            return false;
          }

          for (let gi = 0; gi < l_group_by.length; gi++) {
            const gobj = l_group_by[gi];
            if (f[gobj] != cv[gobj]) {
              return false;
            }
          }

          return true;
        });

        if (found) {
          if ("max" == this.aggregate) {
            found[this.aggregate] = found[this.aggregate] > cv[this.aggregate] ? found[this.aggregate] : cv[this.aggregate];
          } else {
            // else is sum
            found[this.aggregate] = found[this.aggregate] + cv[this.aggregate];
          }
        } else {
          l_pv.push(cv);
        }

        return l_pv;
      }, []);

      // console.log(`floTimelineStats:reloadData - reduce by group sum l_transformed: ${JSON.stringify(l_transformed)}`);

      let ores = DateUtils.get_resolution_by_func_name(this.resolution);

      // reduce by time and aggregate
      l_transformed = l_transformed.reduce((pv, cv) => {
        let l_pv = [];
        if (pv) {
          l_pv = pv;
        }

        let found = l_pv.find((f) => {
          if (l_group_by.length == 0) {
            return false;
          }

          let cv_res = ores.func(cv["odate"]);
          let f_res = ores.func(f["odate"]);
          if (f_res.valueOf() != cv_res.valueOf()) {
            return false;
          }

          for (let gi = 0; gi < l_group_by.length; gi++) {
            const gobj = l_group_by[gi];

            if (f[gobj] != cv[gobj]) {
              return false;
            }
          }

          return true;
        });

        if (found) {
          // found[this.aggregate] = found[this.aggregate] > cv[this.aggregate] ? found[this.aggregate] : cv[this.aggregate];
          if ("max" == this.aggregate) {
            found[this.aggregate] = found[this.aggregate] > cv[this.aggregate] ? found[this.aggregate] : cv[this.aggregate];
          } else {
            // else is sum
            found[this.aggregate] = found[this.aggregate] + cv[this.aggregate];
          }
        } else {
          cv["odate"] = ores.func(cv["odate"]);
          l_pv.push(cv);
        }

        return l_pv;
      }, []);

      // console.log(`floTimelineStats:reloadData - reduce by group max l_transformed: ${JSON.stringify(l_transformed)}`);

      this.records = l_transformed;
      this.loading = false;

      this.redrawChart();
    },
    redrawChart() {
      try {
        if (this.redraw_in_progress == true) {
          return;
        }

        this.redraw_in_progress = true;

        let data = null;
        let dlen = 0;

        if (this.records && this.records.length > 0) {
          data = this.records;
          dlen = data.length;
        }
        let ores = DateUtils.get_resolution_by_func_name(this.resolution);

        let lend = ores.func(new Date());
        let lstart = new Date(lend.getTime() - this.livePastSeconds * 1000);
        this.chartSetup.axis.x.min = lstart;
        this.chartSetup.axis.x.max = lend;

        // set chart type and data
        this.chartSetup.type = this.type;
        this.chartSetup.data = data;
        // set group by
        this.chartSetup.groupBy = this.getQueryGroupBy();
        // set resolution
        this.chartSetup.axis.x.tick.resolution = this.resolution;
        // set the accomulator
        let by = this.aggregate;
        this.chartSetup.axis.y.valueBy = by;
        this.chartSetup.axis.y.max = 100;

        //  set y max value
        if (dlen) {
          let ymax = d3_max(data, (d) => d[by]);
          this.chartSetup.axis.y.max = ymax * 1.1;
        }

        this.redrawTheChart++;
      } catch (err) {
        this.redraw_in_progress = false;
        throw err;
      }

      this.redraw_in_progress = false;
      return;
    },
  },
  created() {
    if (this.levels.length == 0) {
      for (let l = 0; l < 5; l++) {
        let l_level = { level: l, key: `l${l}`, name: `Level ${l}` };
        this.levels.push(l_level);
      }
    }

    for (let i = 0; i < this.groupby.length; i++) {
      const g = this.groupby[i];
      this.digg.push({ gby: g, where: { k: g, op: "=", v: null } });
    }
    this.reloadData();
  },
};
</script>
