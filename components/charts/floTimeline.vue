<template>
  <v-container fluid class="floTimeline ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <v-card flat :class="`mx-auto ${unique} viewport`" :min-height="minHeight" :max-height="maxHeight" v-resize="onResize"></v-card>
      </v-col>
    </v-row>

    <v-row no-gutters>
      <v-col class="px-14">
        <!-- <v-chip-group v-model="d_legend_model" column multiple>
          <v-chip v-for="(ser, i) in d_legend" :key="`cp-${i}`" filter :text-color="ser.fill">{{ ser.name }}</v-chip>
        </v-chip-group> -->
        <v-chip-group column>
          <v-chip v-for="(ser, i) in d_legend" :key="`cp-${i}`" outlined :text-color="ser.fill">{{ ser.name }}</v-chip>
        </v-chip-group>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { select as d3_select } from "d3-selection";
import * as d3_time from "d3-time";
import { format as d3_format } from "d3-format";
import { scaleTime as d3_scaleTime, scaleBand as d3_scaleBand, scalePow as d3_scalePow } from "d3-scale";
import { line as d3_line, area as d3_area, curveMonotoneX as d3_curveMonotoneX } from "d3-shape";
import { zoom as d3_zoom } from "d3-zoom";
import { easeLinear as d3_easeLinear } from "d3-ease";
import { axisLeft as d3_axisLeft, axisRight as d3_axisRight, axisBottom as d3_axisBottom } from "d3-axis";
import helpers from "~/src/helpers.js";
import DateUtils from "~/src/dateUtils.js";
export default {
  name: "floTimeline",
  data: () => ({
    update_in_progress: false,
    update_data_progress: false,
    update_series_progress: false,
    distance: 0,
    rootsvg: null,
    viewport: null,
    liveTimerId: null,
    initialized: false,
    dchart: {
      type: "bar",
      area: {
        width: 0,
        height: 0,
        margin: { left: 80, bottom: 70, right: 30, top: 15 },
      },
      axis: {
        x: {
          valueBy: "odate",
          min: 0,
          max: 0,
          label: {
            name: "Time",
            pad: 40,
          },
          tick: {
            resolution: "toStartOfThirtySecond",
            count: 10,
            size: 10,
            inner: 5,
            outer: 10,
            pad: 10,
            band: 0,
          },
        },
        y: {
          min: 0,
          max: 100,
          label: {
            name: "Items",
            pad: 5,
          },
          tick: {
            count: 10,
            size: 10,
            inner: 5,
            outer: 10,
            pad: 10,
          },
        },
      },
      series: [],
    },
    d_legend_model: [],
    d_legend: [],
    palette: ["#d5385c", "#5cda66", "#9940bb", "#28b847", "#d673e7", "#62ae1d", "#a06fea", "#82c63b", "#4853c6", "#9cbd2d", "#5372eb", "#acaf20", "#5f47aa", "#5ec054", "#c4349a", "#42cf87", "#e960c6", "#348825", "#7d63ca", "#c6c746", "#5d85e6", "#deb037", "#2d5da8", "#e79528", "#5259a9", "#59a43b", "#9d3690", "#8dc65f", "#aa5db9", "#35a45f", "#e73379", "#39bfa0", "#cf3336", "#57d2c8", "#d55025", "#53ccee", "#da7b30", "#6398e3", "#af9b2a", "#824598", "#739936", "#cb3882", "#76ba78", "#d873c4", "#427a32", "#ec94e3", "#727d16", "#af87e0", "#445a06", "#cd81c7", "#a6b75b", "#6a4891", "#c6b460", "#3a6eb0", "#aa8226", "#8366ad", "#5e7222", "#ab5496", "#347f4e", "#ed6993", "#44976e", "#c45386", "#7dc49a", "#ae3946", "#31abb2", "#e6665e", "#55a6d8", "#a75f22", "#377da9", "#e68561", "#1a6447", "#ed8eb6", "#296437", "#c0aaee", "#6a6511", "#908ccd", "#8c8f3d", "#5a5f94", "#e2a86b", "#8e5888", "#476025", "#d598c7", "#63510a", "#ae739f", "#6c8548", "#973763", "#31816a", "#a34a2c", "#aeb579", "#bc648b", "#5e622c", "#e38988", "#796626", "#864863", "#8f844a", "#95454d", "#865e1c", "#b86262", "#b47f50", "#865630"],
  }),
  props: {
    unique: {
      type: String,
      required: true,
    },
    chart: {
      type: Object,
      required: false,
      default: null,
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
    live: {
      type: Boolean,
      required: false,
      default: false,
    },
    update: {
      type: Number,
      required: false,
      default: 1,
    },
    // liveFutureSeconds: {
    //   type: Number,
    //   required: false,
    //   // default: 30,
    //   default: 60 * 25,
    // },
    livePastSeconds: {
      type: Number,
      required: false,
      // default: 60 * 60,
      default: 60 * 25,
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
  },
  watch: {
    live: function (n) {
      if (n == true) {
        this.startLiveUpdate();
      } else {
        this.stopLiveUpdate();
      }
    },
    update: function () {
      this.updateUpperToParentChart();
    },
    chart: function () {},
    y_axis_name: function (n) {
      this.dchart.axis.y.label.name = n;
      this.updateChartLabel(this.dchart);
    },
    x_axis_name: function (n) {
      this.dchart.axis.x.label.name = n;
      this.updateChartLabel(this.dchart);
    },
  },
  beforeDestroy() {
    this.stopLiveUpdate();
  },
  mounted() {
    this.createViewport();
    this.initChart(this.dchart);
    this.doLiveTick();
  },
  created() {
    this.palette[0] = this.$vuetify.theme.currentTheme.info;
    this.palette[1] = this.$vuetify.theme.currentTheme.success;
    this.palette[2] = this.$vuetify.theme.currentTheme.warning;
    this.palette[3] = this.$vuetify.theme.currentTheme.error;

    if (this.live) {
      this.startLiveUpdate();
    }
  },
  methods: {
    updateUpperToParentChart(p_domain) {
      try {
        if (this.update_in_progress == true) {
          return;
        }

        this.update_in_progress = true;
        let updateDomains = false;

        if (!this.dchart.axis.x.min || this.dchart.axis.x.min.getTime() != (this.chart.axis.x.min == 0 ? 0 : this.chart.axis.x.min.getTime())) {
          this.dchart.axis.x.min = this.chart.axis.x.min;
          updateDomains = true;
        }

        if (!this.dchart.axis.x.max || this.dchart.axis.x.max.getTime() != (this.chart.axis.x.max == 0 ? 0 : this.chart.axis.x.max.getTime())) {
          this.dchart.axis.x.max = this.chart.axis.x.max;
          updateDomains = true;
        }
        if (this.dchart.axis.y.min != this.chart.axis.y.min) {
          this.dchart.axis.y.min = this.chart.axis.y.min;
          updateDomains = true;
        }

        if (this.dchart.axis.y.max != this.chart.axis.y.max) {
          this.dchart.axis.y.max = this.chart.axis.y.max;
          updateDomains = true;
        }
        if (this.dchart.axis.x.tick.resolution != this.chart.axis.x.tick.resolution) {
          this.dchart.axis.x.tick.resolution = this.chart.axis.x.tick.resolution;
          updateDomains = true;
        }

        this.dchart.type = this.chart.type;
        this.dchart.groupBy = this.chart.groupBy;
        this.dchart.axis.x.valueBy = this.chart.axis.x.valueBy;
        this.dchart.axis.y.valueBy = this.chart.axis.y.valueBy;
        this.dchart.data = this.chart.data;
        if (p_domain == true) {
          updateDomains = true;
        }
        if (updateDomains) {
          this.updateChartDomains(this.dchart, true);
          this.updateChartRange(this.dchart, false);
        }
        this.updateChartData(this.dchart);
      } catch (err) {
        this.update_in_progress = false;
        throw err;
      }
      this.update_in_progress = false;
    },
    doLiveTick() {
      if (!this.live) {
        return;
      }
      let x_tick_interval = this.dchart.axis.x.tick.interval;
      if (!x_tick_interval) {
        return;
      }
      let ores = DateUtils.get_resolution_by_func_name(this.dchart.axis.x.tick.resolution);
      let lend = ores.func(new Date());
      let lstart = new Date(lend.getTime() - this.livePastSeconds * 1000);

      let rebuild = false;
      // rebuild domain
      if (this.dchart.axis.x.min == 0 || this.dchart.axis.x.min.getTime() != lstart.getTime()) {
        this.dchart.axis.x.min = lstart;
        rebuild = true;
      }

      if (this.dchart.axis.x.max == 0 || this.dchart.axis.x.max.getTime() != lend.getTime()) {
        this.dchart.axis.x.max = lend;
        rebuild = true;
      }
      if (rebuild) {
        this.updateUpperToParentChart(true);
      }
    },
    startLiveUpdate() {
      if (this.liveTimerId != null) {
        console.log(`floTimeline - startLiveUpdate - ${this.unique}- timer already running leave`);
        return;
      }
      //
      this.doLiveTick();
      this.liveTimerId = setInterval(() => {
        this.doLiveTick();
      }, 5000);
    },
    stopLiveUpdate() {
      if (this.liveTimerId) {
        clearInterval(this.liveTimerId);
        this.liveTimerId = null;
      }
    },
    createViewport() {
      const [viewport] = this.$el.getElementsByClassName(this.unique);
      this.viewport = viewport;
      let area = this.getViewportSize();

      // so every thing start here
      this.rootsvg = d3_select(viewport).append("svg").attr("font-family", "roboto").style("overflow", "hidden").attr("class", `root-${this.unique}`).attr("width", area.width).attr("height", area.height).attr("preserveAspectRatio", "none");
    },
    chUtcToIsoUtc(chUtc) {
      return `${chUtc}.00Z`;
    },
    chUtcToLocalDate(chUtc) {
      return new Date(this.chUtcToIsoUtc(chUtc));
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
      if (!ts) {
        return "";
      }
      // console.log('flo-timeline - localToLocalLikeIso - enter')
      // console.log(ts)
      let tsDate = ts;

      return tsDate.getFullYear() + "-" + helpers.pad(tsDate.getMonth() + 1, 2) + "-" + helpers.pad(tsDate.getDate(), 2) + " " + helpers.pad(tsDate.getHours(), 2) + ":" + helpers.pad(tsDate.getMinutes(), 2) + ":" + helpers.pad(tsDate.getSeconds(), 2);
    },
    getViewportSize() {
      if (this.viewport) {
        this.dchart.area.width = this.viewport.clientWidth;
        this.dchart.area.height = this.viewport.clientHeight;
        return { width: this.viewport.clientWidth, height: this.viewport.clientHeight };
      }

      this.dchart.area.width = 0;
      this.dchart.area.height = 0;
      return { width: 0, height: 0 };
    },
    diggIn(event) {
      this.$emit("diggIn", event);
    },
    diggOut(event) {
      this.$emit("diggOut", event);
    },
    removeAllSeries(chart) {
      if (chart._draw) {
        chart._draw.selectAll(".series").remove();
        chart._draw.selectAll(".circles").remove();
        chart._draw.selectAll(".legend").remove();
        chart.series = [];
      }
    },
    drawCirclesSeries(draw, chart, series) {
      // Draw Bars band width
      let data = series.data;
      let x_scale = chart.axis.x._scale;
      let x_tick_interval = chart.axis.x.tick.interval;
      let y_scale = chart.axis.y._scale;
      let lRad = 4;
      let lnow = x_tick_interval.floor(new Date());
      let lnow_ms = lnow.getTime();

      if (!series.circlessvg) {
        series.circlessvg = draw
          .append("g")
          .attr("clip-path", `url(#clip-${this.unique})`)
          .attr("class", `circles circles-${this.safeSelector(series.id)}`);
      }

      series.circlessvg.attr("fill", series.style.fill).attr("fill-opacity", series.style["fill-opacity"]).attr("stroke-width", 0).attr("stroke", series.style.stroke).attr("stroke-opacity", 0).attr("stroke-width", series.style["stroke-width"]);

      let circles = series.circlessvg.selectAll("circle");

      let items = circles.data(data).join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "circle")

            .attr("cx", (d, i) => x_scale(d[chart.axis.x.valueBy]))
            .attr("r", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return lRad * 1.5;
              } else {
                return lRad;
              }
            })
            .attr("cy", (d) => y_scale(d[chart.axis.y.valueBy])),

        (update) =>
          update
            .attr("cx", (d) => x_scale(d[chart.axis.x.valueBy]))
            .attr("cy", (d) => y_scale(d[chart.axis.y.valueBy]))
            .attr("r", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return lRad * 1.5;
              } else {
                return lRad;
              }
            }),
        (exit) => exit.remove()
      );

      let hideToolTip = this.hideToolTip;
      let showToolTip = this.showToolTip;

      // circles
      items
        .on("mouseover", function (event, d, i) {
          d3_select(this).transition().duration("50").attr("stroke-width", 4).attr("stroke-opacity", 1).attr("fill-opacity", 1);
          showToolTip(event, chart, series, d, i);
        })
        .on("mouseout", function (event, d, i) {
          d3_select(this).transition().duration("50").attr("stroke-width", 0).attr("stroke-opacity", 0).attr("fill-opacity", series.style["fill-opacity"]);

          hideToolTip(event, chart);
        })
        .on("dblclick", (event, d) => {
          event.preventDefault();
          this.diggIn(d);
        });
    },
    drawBarSeries(draw, chart, series) {
      // Draw Bars band width
      let data = series.data;
      let x_scale = chart.axis.x._scale;
      let x_tick_interval = chart.axis.x.tick.interval;
      let y_scale = chart.axis.y._scale;
      let bandwidth = chart.axis.x.tick._band;

      if (series.type != chart.type) {
        if (series.svg) {
          series.svg.remove();
          series.svg = null;
        }
      }
      series.type = chart.type;

      let l_stroke_width = series.style["stroke-width"];

      if (!series.svg) {
        series.svg = draw
          .append("g")
          .attr("clip-path", `url(#clip-${this.unique})`)
          .attr("class", `series series-${this.safeSelector(series.id)} bars`)
          .attr("fill", series.style.fill)
          .attr("fill-opacity", series.style["fill-opacity"])
          .attr("stroke", series.style.stroke)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", l_stroke_width);
      }

      let rects = series.svg.selectAll("rect");
      let lnow = x_tick_interval.floor(new Date());
      let lnow_ms = lnow.getTime();

      let items = rects.data(data).join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "rect")
            .call((ent) => {
              return (
                ent
                  // .transition() // good transition KEEP .. JUST TRY WITHOUT
                  .attr("x", (d) => {
                    let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]);
                    let xs = x_scale(xi);
                    let xf = xs + (bandwidth * series.idx + 2);
                    // console.log(`timeline - enter - call: xi: ${xi}, xf: ${xf}, xs: ${xs}`);

                    return xf;
                  })
              );
            })

            .attr("y", (d) => {
              const y = y_scale(d[chart.axis.y.valueBy]);
              // console.log(`timeline - enter - y: ${y}`);
              return y;
            })
            .attr("height", (d) => y_scale(chart.axis.y.min) - y_scale(d[chart.axis.y.valueBy]))
            .attr("width", (d) => {
              // const w = bandwidth <= 4 ? 4 : bandwidth - 4 ;
              // const w = bandwidth <= 4 ? bandwidth : bandwidth - 4 ;
              let w = bandwidth;
              if (bandwidth > 2 && bandwidth < 4) {
                w = bandwidth - 2;
              } else if (bandwidth > 4) {
                w = bandwidth - 4;
              }
              // const w = bandwidth;
              // console.log(`timeline - enter - w: ${w}, bandwidth:${bandwidth}`);
              return w;
            })
            .attr("fill-opacity", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return 0.1;
              } else {
                return series.style["fill-opacity"];
              }
            })
            .attr("stroke-width", (d) => {
              if (bandwidth <= 4) {
                return 0.5;
              }
              return l_stroke_width;
            })
            .attr("stroke-dasharray", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return "4 4";
              } else {
                return "none";
              }
            }),

        (update) =>
          update
            .call((updt) =>
              updt.attr("x", (d) => {
                let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]);
                let xs = x_scale(xi);
                let xf = xs + (bandwidth * series.idx + 2);
                // console.log(`timeline - update - call: xi: ${xi}, xf: ${xf}, xs: ${xs}`);
                return xf;
              })
            )
            .attr("y", (d) => {
              const y = y_scale(d[chart.axis.y.valueBy]);
              // console.log(`timeline - update - y: ${y}`);
              return y;
            })
            .attr("width", (d) => {
              // const w = bandwidth <= 4 ? 4 : bandwidth - 4 ;
              // const w = bandwidth <= 4 ? bandwidth : bandwidth - 4 ;
              let w = bandwidth;
              if (bandwidth > 2 && bandwidth < 4) {
                w = bandwidth - 2;
              } else if (bandwidth > 4) {
                w = bandwidth - 4;
              }
              // const w = bandwidth;
              // console.log(`timeline - update - w: ${w}, bandwidth:${bandwidth}`);
              return w;
            })
            .attr("height", (d) => y_scale(chart.axis.y.min) - y_scale(d[chart.axis.y.valueBy]))
            .attr("fill-opacity", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return 0.1;
              } else {
                return series.style["fill-opacity"];
              }
            })
            .attr("stroke-width", (d) => {
              if (bandwidth <= 4) {
                return 0.5;
              }
              return l_stroke_width;
            })
            .attr("stroke-dasharray", (d) => {
              let xi = x_tick_interval.floor(d[chart.axis.x.valueBy]).getTime();
              if (xi == lnow_ms) {
                return "4 4";
              } else {
                return "none";
              }
            }),

        (exit) => {
          return exit.remove();
        }
      );

      let hideToolTip = this.hideToolTip;
      let showToolTip = this.showToolTip;
      items
        .on("mouseover", function (event, d, i) {
          // let l_sw = 2;
          // if (bandwidth <= 4) {
          //   l_sw = 1;
          // }
          d3_select(this).transition().duration("50").attr("stroke-width", 2).attr("fill-opacity", 0.4);
          // d3_select(this).transition().duration("50").attr("stroke-width", 2).attr("fill-opacity", 0.4);
          // d3_select(this).transition().duration("50").attr("fill-opacity", 0.4);
          showToolTip(event, chart, series, d, i);
        })
        .on("mouseout", function (event) {
          let l_sw = l_stroke_width;
          if (bandwidth <= 4) {
            l_sw = 0.5;
          }
          d3_select(this).transition().duration("50").attr("stroke-width", l_sw).attr("fill-opacity", series.style["fill-opacity"]);
          // d3_select(this).transition().duration("50").attr("stroke-width", l_stroke_width).attr("fill-opacity", series.style["fill-opacity"]);
          // d3_select(this).transition().duration("50").attr("fill-opacity", series.style["fill-opacity"]);

          hideToolTip(event, chart);
        })
        .on("dblclick", (event, d) => {
          event.preventDefault();
          this.diggIn(d);
        });
    },
    drawAreaSeries(draw, chart, series) {
      let data = series.data;

      if (series.type != chart.type) {
        if (series.svg) {
          series.svg.remove();
          series.svg = null;
        }
      }
      series.type = chart.type;
      if (!series.svg) {
        series.svg = draw
          .append("g")
          .attr("clip-path", `url(#clip-${this.unique})`)
          .attr("stroke", series.style.stroke)
          .attr("stroke-opacity", 0.6)
          .attr("stroke-width", series.style["stroke-width"])
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("class", `series series-${this.safeSelector(series.id)} areas`)
          .attr("fill-opacity", series.style["fill-opacity"])
          .attr("fill", series.style.fill);
      }

      series.svg
        .selectAll("path")
        .data([data])
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("class", "line")
              .on("mouseover", function () {
                d3_select(this).transition().duration("50").attr("stroke-width", 4).attr("fill-opacity", 0.4);
              })
              .on("mouseout", function () {
                d3_select(this).transition().duration("50").attr("stroke-width", series.style["stroke-width"]).attr("fill-opacity", series.style["fill-opacity"]);
              })
              .on("dblclick", (event, d) => {
                event.preventDefault();
                this.diggIn(d[0]);
              }),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("d", series.func);
    },
    drawLineSeries(draw, chart, series) {
      let data = series.data;

      if (series.type != chart.type) {
        if (series.svg) {
          series.svg.remove();
          series.svg = null;
        }
      }
      series.type = chart.type;

      if (!series.svg) {
        series.svg = draw
          .append("g")
          .attr("clip-path", `url(#clip-${this.unique})`)
          .attr("class", `series series-${this.safeSelector(series.id)} lines`)
          .attr("fill", "none")
          .attr("stroke", series.style.stroke)
          .attr("stroke-width", series.style["stroke-width"])
          .attr("stroke-opacity", 0.6)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("fill", "none");
      }
      series.svg
        .selectAll("path")
        .data([data])
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("class", "line")
              .on("mouseover", function () {
                d3_select(this).transition().duration("50").attr("stroke-width", 4).attr("fill-opacity", 0.4);
              })
              .on("mouseout", function () {
                d3_select(this).transition().duration("50").attr("stroke-width", series.style["stroke-width"]).attr("fill-opacity", series.style["fill-opacity"]);
              })
              .on("dblclick", (event, d) => {
                event.preventDefault();
                this.diggIn(d[0]);
              }),
          (update) => update,
          (exit) => exit.remove()
        )
        .attr("d", series.func);
    },
    drawLegend(chart) {
      let draw = chart._draw;
      if (!draw) {
        this.d_legend = [];
        this.d_legend_model = [];
        return;
      }

      let series = chart.series;
      // let legend = chart._legend;
      this.d_legend = [];
      this.d_legend_model = [];
      for (let i = 0; i < series.length; i++) {
        const s = series[i];

        this.d_legend_model.push(i);

        this.d_legend.push({
          id: i,
          key: s.id,
          lid: `legend_${s.id}`,
          fill: s.style.fill,
          name: helpers.capitalizeAllFLetter(s.niceName),
        });
      }

      //   let onel = legend.append("g")
      //     .attr("class", `legend_item legend_${s.id}`)
      //     // .style("font", "16px roboto")
      //     .attr("font-size", 16)
      //     .attr("dy", ".35em")
      //     .attr("text-anchor", "start")
      //     .style("fill", s.style.fill);

      //   onel
      //     .append("circle")
      //     .attr("r", lRad)
      //     .attr("transform", "translate(" + lxPad + "," + i * 30 + ")");

      //   onel
      //     .append("text")
      //     .attr("stroke-width", 0)
      //     .attr("transform", "translate(" + (lxPad + ltextPad) + "," + (i * 30 + lRadHalf) + ")")
      //     .text(`${helpers.capitalizeAllFLetter(s.niceName)}`);
      // }

      // if (!legend) {
      //   // console.log(`floTimeline - drawLegend - removed.`);
      // } else {
      //   legend.remove();
      //   legend = null;
      //   chart._legend = null;
      // }

      // legend = draw.append("g").attr("class", "legend");
      // chart._legend = legend;

      // let lxPad = 20;
      // let ltextPad = 20;
      // let lRad = 6;
      // let lRadHalf = 5;

      // for (let i = 0; i < series.length; i++) {
      //   const s = series[i];

      //   let onel = legend.append("g")
      //     .attr("class", `legend_item legend_${s.id}`)
      //     // .style("font", "16px roboto")
      //     .attr("font-size", 16)
      //     .attr("dy", ".35em")
      //     .attr("text-anchor", "start")
      //     .style("fill", s.style.fill);

      //   onel
      //     .append("circle")
      //     .attr("r", lRad)
      //     .attr("transform", "translate(" + lxPad + "," + i * 30 + ")");

      //   onel
      //     .append("text")
      //     .attr("stroke-width", 0)
      //     .attr("transform", "translate(" + (lxPad + ltextPad) + "," + (i * 30 + lRadHalf) + ")")
      //     .text(`${helpers.capitalizeAllFLetter(s.niceName)}`);
      // }
    },
    getRandomColor() {
      let letters = "0123456789ABCDEF";
      let color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    nameToColor(name) {
      let hash = this.hashStr(name);
      let index = hash % this.palette.length;
      return this.palette[index];
    },
    hashStr(str) {
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        hash += charCode;
      }
      return hash;
    },
    getColor(id) {
      if (id >= this.palette.length) return this.getRandomColor();

      return this.palette[id];
    },
    getDateTimeFormat() {
      let ares = DateUtils.get_resolution_by_func_name(this.analytics.resolution); //this.resolutions.filter((r) => r.f === this.analytics.resolution);

      if (ares.length < 0) return false;
      if (ares[0].onlyDate) return "YYYY-MM-DD";
      else return "YYYY-MM-DD HH:mm:ss";
    },
    _groupBy(data, groupBy) {
      if (!data) {
        return null;
      }

      let gby = groupBy;

      // do it yourself nest
      let l_nest_map = {};
      for (let i = 0; i < data.length; i++) {
        const oi = data[i];
        // compute key
        let lkey = "";
        let nkey = "";
        for (let i = 0; i < gby.length; i++) {
          const g = gby[i];
          if (lkey === "") {
            lkey = `/${oi[g]}`;
            nkey = `${oi[g]}`;
          } else {
            lkey += `/${oi[g]}`;
            nkey += `${oi[g]}`;
          }
        }

        // check the key
        if (!l_nest_map.hasOwnProperty(lkey)) {
          l_nest_map[lkey] = {
            key: nkey,
            values: [],
          };
        }

        // push to values
        l_nest_map[lkey].values.push(oi);
      }

      // convert to array
      let l_nest_arr = [];
      for (const skey of Object.keys(l_nest_map)) {
        l_nest_arr.push(l_nest_map[skey]);
      }

      return l_nest_arr;
    },

    nameToProperKey(name) {
      let key = name.replace(" ", "_");
      return key;
    },

    showToolTip(event, chart, series, d, i) {
      let x_scale = chart.axis.x._scale;
      // don't remove this comment
      // let y_scale = chart.axis.y._scale;
      let bandwidth = chart.axis.x.tick._band;

      let localToLocalLikeIso = this.localToLocalLikeIso;

      chart.tooltip.select("rect").attr("stroke", series.style.stroke);

      chart.tooltip.selectAll("text").text((h, i) => {
        if (i === 0) {
          return localToLocalLikeIso(d[chart.axis.x.valueBy]);
        } else if (i === 1) {
          return `${series.niceName}`;
        } else if (i === 2) {
          return `${d[chart.axis.y.valueBy]}`;
        }
      });

      let nx = x_scale(d[chart.axis.x.valueBy]);
      if (chart.type === "bar") {
        let gp = 0;

        if (bandwidth > 0) {
          gp = bandwidth * series.idx + 2;
        }

        nx += gp;
      }

      // don't remove this comment
      // let ny = y_scale(d[chart.axis.y.valueBy]);
      if (nx - 160 / 2 < 0) {
        nx = 160 / 2;
      }
      // chart.tooltip.attr("transform", "translate(" + nx + "," + (ny > 100 ? ny - 100 : ny + 10) + ")");
      chart.tooltip.attr("transform", "translate(" + nx + "," + -10 + ")");
      chart.tooltip.style("visibility", "visible");
    },

    hideToolTip(event, chart) {
      chart.tooltip.style("visibility", "hidden");
    },
    createToolTip(draw) {
      let x = 0;
      let y = 0;
      let ypad = 25;
      let w = 160;
      let h = 90;
      let rx = 15;

      let tooltip = draw.append("g").attr("class", "tooltip").style("visibility", "hidden");

      tooltip
        .append("rect")
        .attr("fill", "currentColor")
        .attr("fill-opacity", 0.2)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 1)
        // .attr("rx", rx)
        .attr("x", x - w / 2)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h);

      tooltip
        .append("text")
        .attr("class", "toolline1")
        .attr("font-size", 14)
        .attr("fill", "currentColor")
        .attr("fill-opacity", 0.8)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 0)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("x", x)
        .attr("y", y + ypad * 3)
        .text("2020-08-26 00:00:00");

      tooltip
        .append("text")
        .attr("class", "toolline2")
        .attr("font-size", 16)
        .attr("fill", "currentColor")
        .attr("fill-opacity", 1)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0)
        .attr("stroke-width", 0)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("x", x)
        .attr("y", y + ypad * 1)
        .text("Success");

      tooltip
        .append("text")
        .attr("class", "toolline3")
        .attr("font-size", 16)
        .attr("fill", "currentColor")
        .attr("fill-opacity", 1)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 1)
        .attr("stroke-width", 0)
        .attr("alignment-baseline", "middle")
        .attr("text-anchor", "middle")
        .attr("x", x)
        .attr("y", y + ypad * 2)
        .text("200000");

      return tooltip;
    },
    getResTick(res_func_name) {
      switch (res_func_name) {
        case "toStartOfThirtySecond":
          return d3_time.timeSecond.every(30);
        case "toStartOfFifteenSecond":
          return d3_time.timeSecond.every(15);
        case "toStartOfTenSecond":
          return d3_time.timeSecond.every(10);
        case "toStartOfSecond":
          return d3_time.timeSecond.every(1);
        case "toStartOfMinute":
          return d3_time.timeMinute.every(1);
        case "toStartOfFiveMinute":
          return d3_time.timeMinute.every(5);
        case "toStartOfTenMinutes":
          return d3_time.timeMinute.every(10);
        case "toStartOfFifteenMinutes":
          return d3_time.timeMinute.every(15);
        case "toStartOfHour":
          return d3_time.timeHour.every(1);
        case "toStartOfDay":
          return d3_time.timeDay.every(1);
        case "toStartOfWeek":
          return d3_time.timeWeek.every(1);
        case "toStartOfMonth":
          return d3_time.timeMonth.every(1);
        case "toStartOfQuarter":
          return d3_time.timeMonth.every(4);
        case "toStartOfYear":
          return d3_time.timeYear.every(1);
        default:
          return 0;
      }
    },
    updateResulotion(chart) {
      let resolution = chart.axis.x.tick.resolution;
      let ores = DateUtils.get_resolution_by_func_name(resolution);
      let x_tick_interval = this.getResTick(ores.f);

      if (x_tick_interval != chart.axis.x.tick.interval) {
        chart.axis.x.tick.interval = x_tick_interval;
      }
    },
    initChart(chart) {
      if (!chart) {
        return;
      }

      if (chart.axis.x.min === 0 || chart.axis.x.max === 0) {
        let lnow = new Date();
        chart.axis.x.min = new Date(lnow - this.livePastSeconds * 1000);
        chart.axis.x.max = lnow;
      }

      this.updateResulotion(chart);
      let x_tick_interval = chart.axis.x.tick.interval;

      this.getViewportSize();

      let width = chart.area.width;
      let height = chart.area.height;

      let margin = chart.area.margin;
      let rootsvg = d3_select(this.viewport)
        .select("svg")
        .attr("viewBox", [-margin.left, -margin.top, width + (margin.left + margin.right), height + (margin.top + margin.bottom)])
        .attr("width", width)
        .attr("height", height);
      // .style("font", "10px roboto");

      // hold is a local variable
      this.rootsvg = rootsvg;

      // we add our first graphics
      const draw = rootsvg.append("g").attr("class", "chartdraw"); //.attr("font-family", "roboto");

      chart._draw = draw;

      // CREATE SCALES X and Y
      let x_scale = d3_scaleTime()
        .domain([x_tick_interval.floor(chart.axis.x.min), x_tick_interval.ceil(chart.axis.x.max)])
        .range([0, width]);

      // Add an ordinal scale
      let x_band_scale = d3_scaleBand()
        .domain(x_tick_interval.range(x_tick_interval.floor(chart.axis.x.min), x_tick_interval.ceil(chart.axis.x.max)))
        .range([0, width]);

      chart.axis.x._scale = x_scale;
      chart.axis.x._band_scale = x_band_scale;

      let y_scale = d3_scalePow().exponent(0.5).domain([chart.axis.y.min, chart.axis.y.max]).range([height, 0]);

      chart.axis.y._scale = y_scale;

      // // CREATE CLIP AREA
      let clip = rootsvg
        .append("defs")
        .append("clipPath")
        .attr("id", `clip-${this.unique}`)
        .append("rect")
        .attr("x", x_scale(x_tick_interval.floor(chart.axis.x.min)))
        .attr("y", y_scale(chart.axis.y.max))
        .attr("width", width)
        .attr("height", height);

      // CREATE BACKGROUND AREA
      let background_rect = draw
        .append("g")
        .attr("class", "chart_bg")
        .append("rect")
        .attr("x", x_scale(x_tick_interval.floor(chart.axis.x.min)))
        .attr("y", y_scale(chart.axis.y.max))
        .attr("width", width)
        .attr("height", height)
        .attr("style", "fill:rgba(255,255,255,0.1)")
        .on("dblclick", (event, d) => {
          event.preventDefault();
          this.diggOut(d);
        });

      // DEBUG BACKGROUND DIAGONAL
      // let line = draw
      // .append("g")
      // .attr("class", "chart_bg-dieg")
      //   .append("line")
      //   .attr("x1", x_scale(chart.axis.x.min))
      //   .attr("y1", y_scale(chart.axis.y.min))
      //   .attr("x2", x_scale(chart.axis.x.max))
      //   .attr("y2", y_scale(chart.axis.y.max))
      //   .attr("stroke", "white");

      // X AXIS definition
      let x_axis = d3_axisBottom()
        .scale(x_scale)
        .ticks(chart.axis.x.tick.count)
        .tickSize(chart.axis.x.tick.size) // length of the tick
        .tickSizeInner(chart.axis.x.tick.inner)
        .tickSizeOuter(chart.axis.x.tick.outer)
        .tickPadding(chart.axis.x.tick.pad);

      let x_axis_grid = d3_axisBottom()
        .scale(x_scale)
        .ticks(chart.axis.x.tick.count)
        .tickSize(height) // length of the tick
        .tickFormat("");

      chart.axis.x._x_axis = x_axis;
      chart.axis.x._x_axis_grid = x_axis_grid;

      // X AXIS SVG
      let svg_x_axis = draw.append("g").attr("class", "x-axis").attr("clip-path", `url(#clip-${this.unique})`).attr("transform", `translate(0, ${height})`);

      svg_x_axis.call(x_axis).selectAll("text").attr("font-size", "12").attr("dy", ".35em").attr("transform", "rotate(30)").style("text-anchor", "start");

      // svg_x_axis.attr("font-family", "roboto");

      // add the X gridlines
      let svg_x_axis_grid = draw.append("g").attr("class", "x-grid").attr("clip-path", `url(#clip-${this.unique})`).attr("stroke", "grey").attr("stroke-width", 0.1).attr("stroke-dasharray", "3, 3").call(x_axis_grid);

      // Y AXIS definition
      let y_axis = d3_axisLeft()
        .scale(y_scale)
        .ticks(chart.axis.y.tick.count)
        .tickSize(chart.axis.y.tick.size) // length of the tick
        .tickSizeInner(chart.axis.y.tick.inner)
        .tickSizeOuter(chart.axis.y.tick.outer)
        .tickPadding(chart.axis.y.tick.pad)
        .tickFormat(function (d) {
          return d3_format("~s")(d);
        });

      let y_axis_grid = d3_axisRight()
        .scale(y_scale)
        .ticks(chart.axis.y.tick.count)
        .tickSize(width) // length of the tick
        .tickFormat("");

      chart.axis.y._y_axis = y_axis;
      chart.axis.y._y_axis_grid = y_axis_grid;

      // Y AXIS SVG
      let svg_y_axis = draw.append("g").attr("class", "y-axis");
      svg_y_axis.call(y_axis).selectAll("text").attr("font-size", "12").style("text-anchor", "end");

      // svg_y_axis.attr("font-family", "roboto");

      // add the Y gridlines
      let svg_y_axis_grid = draw.append("g").attr("class", "y-grid").attr("clip-path", `url(#clip-${this.unique})`).attr("stroke", "grey").attr("stroke-width", 0.1).attr("stroke-dasharray", "3, 3").call(y_axis_grid);

      // Note: x.invert(80); // Given a value from the range, returns the corresponding value from the domain.
      // text label for the x axis
      chart.axis.x.label.name = this.x_axis_name;
      let xlabel = draw
        .append("text")
        .attr("class", "x-label")
        .attr("font-size", 18)
        .attr("x", 0)
        .attr("y", 0)
        .attr("fill", "currentColor")
        .style("text-anchor", "middle")
        .attr("stroke-width", 0.1)
        .text(chart.axis.x.label.name)
        .attr("x", width / 2)
        .attr("y", height + margin.top + chart.axis.x.label.pad);

      chart.axis.y.label.name = this.y_axis_name;

      let ylabel = draw
        .append("text")
        .attr("class", "y-label")
        .attr("font-size", 18)
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + chart.axis.y.label.pad)
        .attr("x", 0 - height / 2)
        .attr("dy", "1em")
        .attr("fill", "currentColor")
        .attr("stroke-width", 0.1)
        .style("text-anchor", "middle")
        .text(chart.axis.y.label.name);

      chart.axis.y._ylabel = ylabel;

      let tooltip = this.createToolTip(draw, chart);

      chart["tooltip"] = tooltip;
      this.zoom(rootsvg);
      return;
    },
    updateChartDomains(chart, drop_series) {
      // remove all series
      if (drop_series) {
        this.removeAllSeries(chart);
      }

      // get x-scale
      let x_scale = chart.axis.x._scale;

      // get band scale
      let x_band_scale = chart.axis.x._band_scale;

      // get resulotion
      this.updateResulotion(chart);

      let x_tick_interval = chart.axis.x.tick.interval;
      let y_scale = chart.axis.y._scale;

      if (!x_scale) {
        return;
      }

      // UPDATE X scale
      x_scale.domain([x_tick_interval.floor(chart.axis.x.min), x_tick_interval.ceil(chart.axis.x.max)]);
      let range = x_tick_interval.range(x_tick_interval.floor(chart.axis.x.min), x_tick_interval.ceil(chart.axis.x.max));
      x_band_scale.domain(range);
      // UPDATE Y scale
      y_scale.domain([chart.axis.y.min, chart.axis.y.max]);
    },
    updateChartRange(chart) {
      this.getViewportSize();
      let width = chart.area.width;
      let height = chart.area.height;
      let margin = chart.area.margin;

      let rootsvg = d3_select(this.viewport)
        .select("svg")
        .attr("viewBox", [-margin.left, -margin.top, width + (margin.left + margin.right), height + (margin.top + margin.bottom)])
        .attr("width", width)
        .attr("height", height);

      let draw = chart._draw;

      // CREATE SCALES X and Y
      let x_scale = chart.axis.x._scale;
      let x_band_scale = chart.axis.x._band_scale;
      let x_axis = chart.axis.x._x_axis;
      let x_axis_grid = chart.axis.x._x_axis_grid;
      let y_scale = chart.axis.y._scale;

      if (!x_scale) {
        return;
      }

      x_scale.range([0, width]);
      x_band_scale.range([0, width]);
      y_scale.range([height, 0]);
      this.zoom(rootsvg);

      // UPDATE CLIP AREA
      let bg = {
        x: 0,
        y: 0,
        width: width,
        height: height,
      };

      let clip = rootsvg.select("defs").select("rect");
      clip.attr("x", bg.x).attr("y", bg.y).attr("width", bg.width).attr("height", bg.height);

      // UPDTAE BACKGROUND AREA
      let background_rect = draw.select(".chart_bg").select("rect");

      background_rect.attr("x", bg.x).attr("y", bg.y).attr("width", bg.width).attr("height", bg.height);

      // UPDATE X
      chart.axis.x.tick._band = x_band_scale.bandwidth() / (chart.series.length > 0 ? chart.series.length : 1);
      x_axis.ticks(chart.axis.x.tick.count);
      x_axis_grid.ticks(chart.axis.x.tick.count);
      x_axis_grid.tickSize(height);

      let svg_x_axis = draw.select(".x-axis");
      svg_x_axis
        .transition() // good transition
        .ease(d3_easeLinear)
        .call(x_axis)
        .selectAll("text")
        .attr("font-size", "12")
        .attr("dy", ".35em")
        .attr("transform", "rotate(30)")
        .style("text-anchor", "start");

      let svg_x_axis_grid = draw.select(".x-grid");
      svg_x_axis_grid.call(x_axis_grid);

      let xlabel = draw.select(".x-label");
      xlabel.attr("x", width / 2).attr("y", height + margin.top + chart.axis.x.label.pad);

      // UPDATE Y
      let y_axis = chart.axis.y._y_axis;
      let y_axis_grid = chart.axis.y._y_axis_grid;
      y_axis_grid.tickSize(width);

      // UPDATE Y AXIS SVG
      let svg_y_axis = draw.select(".y-axis");
      svg_y_axis
        .transition() // good transition
        .call(y_axis)
        .selectAll("text")
        .attr("font-size", "12")
        .style("text-anchor", "end");

      // UPDATE Y gridlines
      let svg_y_axis_grid = draw.select(".y-grid");
      svg_y_axis_grid.call(y_axis_grid);
    },
    updateChartLabel(chart) {
      let y_label = chart.axis.y._ylabel;
      if (y_label) {
        y_label.text(chart.axis.y.label.name);
      }
    },
    genSeriesData(groupByData, valueBy) {
      let lseries = [];

      for (let i = 0; i < groupByData.length; i++) {
        const sdata = groupByData[i];
        let color = this.getColor(i);
        if (sdata.key.toLowerCase().indexOf("error") > -1) {
          color = "#E06057";
        }

        let s = {
          id: this.nameToProperKey(sdata.key),
          type: null,
          func: null,
          name: sdata.key,
          niceName: sdata.key,
          by: valueBy,
          style: {
            fill: color,
            "fill-opacity": "0.2",
            stroke: color,
            "stroke-width": 1.5,
          },

          data: sdata.values,
        };
        lseries.push(s);
      }

      return lseries;
    },

    updateChartData(chart) {
      try {
        if (this.update_data_progress == true) {
          return;
        }

        this.update_data_progress = true;

        let rootsvg = d3_select(this.viewport);
        let draw = chart._draw;
        // GET SCALES X and Y
        let x_scale = chart.axis.x._scale;
        let x_band_scale = chart.axis.x._band_scale;
        let x_tick_interval = chart.axis.x.tick.interval;

        // GET SCALES Y
        let y_scale = chart.axis.y._scale;
        let y_axis = chart.axis.y._y_axis;
        let y_axis_grid = chart.axis.y._y_axis_grid;

        if (!x_scale) {
          return;
        }

        let data = chart.data;
        let dlen = 0; // data length
        if (data) {
          dlen = data.length; // data length
        }
        let groupByData = this._groupBy(data, chart.groupBy);
        let groupByDataLen = 1;

        if (groupByData) {
          groupByDataLen = groupByData.length;
        }

        chart.axis.x.tick._band = x_band_scale.bandwidth() / groupByDataLen;
        let rebuild_series = false;
        if (groupByData) {
          let lgseries = this.genSeriesData(groupByData, chart.axis.y.valueBy);
          let lcseries = chart.series;
          const gkeys = lgseries.map((s) => s.id);
          const ekeys = lcseries.map((s) => s.id);

          // filter existing series
          let geser = lcseries.filter((s) => ekeys.indexOf(s.id) > -1);

          // filter new services
          let gnser = lgseries.filter((s) => ekeys.indexOf(s.id) == -1);

          // filter dead
          let gser_dead = lcseries.filter((s) => gkeys.indexOf(s.id) == -1);

          if (gser_dead.length > 0) {
            chart.series_dead = lcseries;
            chart.series = lgseries;
          } else {
            // mark deleted
            chart.series_dead = gser_dead;

            let lfinal_serv = [];

            // add and update existing
            for (let i = 0; i < geser.length; i++) {
              let oi = geser[i];
              // get update
              let gusers = lgseries.filter((s) => s.id == oi.id);
              if (gusers.length > 0) {
                let guser = gusers[0];
                // update the data only
                oi.data = guser.data;
              }

              lfinal_serv.push(oi);
            }

            // push new
            for (let i = 0; i < gnser.length; i++) {
              let oi = gnser[i];
              lfinal_serv.push(oi);
            }

            chart.series = lfinal_serv;
          }
        } else {
          chart.series_dead = chart.series;
          chart.series = [];
        }

        this.updateChartSeries(chart);
      } catch (err) {
        this.update_data_progress = false;
        throw err;
      }

      this.update_data_progress = false;
    },
    safeSelector(p_id) {
      const encoded = new Buffer(p_id).toString("hex");
      return encoded;
    },
    updateChartSeries(chart) {
      try {
        if (this.update_series_progress == true) {
          return;
        }
        this.update_series_progress = true;

        let draw = chart._draw;

        // GET SCALES X and Y
        let x_scale = chart.axis.x._scale;
        let x_band_scale = chart.axis.x._band_scale;
        let x_tick_interval = chart.axis.x.tick.interval;

        // GET SCALES Y
        let y_scale = chart.axis.y._scale;
        let y_axis = chart.axis.y._y_axis;
        let y_axis_grid = chart.axis.y._y_axis_grid;

        let farea = d3_area()
          .curve(d3_curveMonotoneX)
          .x((d) => x_scale(d[chart.axis.x.valueBy]))
          .y0(y_scale(chart.axis.y.min))
          .y1((d) => y_scale(d[chart.axis.y.valueBy]));

        let fline = d3_line()
          .x(function (d) {
            return x_scale(d[chart.axis.x.valueBy]);
          })
          .y(function (d) {
            return y_scale(d[chart.axis.y.valueBy]);
          })
          .curve(d3_curveMonotoneX);

        // remove dead series ..
        if (chart.series_dead && chart.series_dead.length) {
          for (let ds = 0; ds < chart.series_dead.length; ds++) {
            const ods = chart.series_dead[ds];
            chart._draw.selectAll(`.series-${this.safeSelector(ods.id)}`).remove();
            chart._draw.selectAll(`.circles-${this.safeSelector(ods.id)}`).remove();
          }

          chart.series_dead = [];
        }

        let lseries = chart.series;

        for (let i = 0; i < lseries.length; i++) {
          let s = lseries[i];
          s.idx = i;

          if (chart.type === "bar") {
            if (s.type != chart.type) {
              if (s.circlessvg) {
                s.circlessvg.remove();
                s.circlessvg = null;
              }
            }

            this.drawBarSeries(draw, chart, s);
          } else if (chart.type === "line") {
            s.func = fline;
            this.drawLineSeries(draw, chart, s);
            this.drawCirclesSeries(draw, chart, s);
          } else if (chart.type === "area") {
            s.func = farea;
            this.drawAreaSeries(draw, chart, s);
            this.drawCirclesSeries(draw, chart, s);
          }
        }

        this.drawLegend(chart);
      } catch (err) {
        this.update_series_progress = false;
        throw err;
      }

      this.update_series_progress = false;
    },
    zoom(svg) {
      let chart = this.dchart;

      let updateChartSeries = this.updateChartSeries;
      const extent = [
        [0, 0],
        [chart.area.width, chart.area.height],
      ];

      svg.call(d3_zoom().scaleExtent([1, 15]).translateExtent(extent).extent(extent).on("zoom", zoomed));

      svg.on("dblclick.zoom", null);

      function zoomed(event) {
        if (!event) {
          return;
        }
        // console.log(event)
        // if (!event.hasOwnProperty(transform)) {
        //   return;
        // }

        let x_scale = chart.axis.x._scale;
        let x_band_scale = chart.axis.x._band_scale;
        let x_axis_grid = chart.axis.x._x_axis_grid;
        let x_axis = chart.axis.x._x_axis;
        let width = chart.area.width;
        chart.area._k = event.transform;
        x_scale.range([0, width].map((d) => event.transform.applyX(d)));
        x_band_scale.range([0, width].map((d) => event.transform.applyX(d)));
        chart.axis.x.tick._band = x_band_scale.bandwidth() / (chart.series.length > 0 ? chart.series.length : 1);
        let ncount = chart.axis.x.tick.count * event.transform.k;
        x_axis.ticks(ncount);
        x_axis_grid.ticks(ncount);
        svg.select(".x-axis").call(x_axis).selectAll("text").attr("font-size", "12").attr("dy", ".35em").attr("transform", "rotate(30)").style("text-anchor", "start");
        svg.select(".x-grid").call(x_axis_grid);
        updateChartSeries(chart);
      }
    },
    onResize() {
      this.updateChartRange(this.dchart, false);
    },
  },
};
</script>
