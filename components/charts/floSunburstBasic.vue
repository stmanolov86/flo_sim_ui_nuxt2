<template>
  <v-container fluid class="floSunburstBasic ma-0 pa-0">
    <v-row no-gutters>
      <v-col>
        <v-card flat :class="`mx-auto ${unique} viewport`" :min-height="minHeight" :max-height="maxHeight" v-resize="onResize"> </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { select as d3_select } from "d3-selection";
import { hierarchy as d3_hierarchy, partition as d3_partition } from "d3-hierarchy";
import { interpolate as d3_interpolate } from "d3-interpolate";
import { hsl as d3_hsl } from "d3-color";
import { arc as d3_arc } from "d3-shape";
export default {
  name: "floSunburstBasic",
  data: () => ({
    paused: false,
    rootsvg: null,
    viewport: null,
    palette: ["#d5385c", "#5cda66", "#9940bb", "#28b847", "#d673e7", "#62ae1d", "#a06fea", "#82c63b", "#4853c6", "#9cbd2d", "#5372eb", "#acaf20", "#5f47aa", "#5ec054", "#c4349a", "#42cf87", "#e960c6", "#348825", "#7d63ca", "#c6c746", "#5d85e6", "#deb037", "#2d5da8", "#e79528", "#5259a9", "#59a43b", "#9d3690", "#8dc65f", "#aa5db9", "#35a45f", "#e73379", "#39bfa0", "#cf3336", "#57d2c8", "#d55025", "#53ccee", "#da7b30", "#6398e3", "#af9b2a", "#824598", "#739936", "#cb3882", "#76ba78", "#d873c4", "#427a32", "#ec94e3", "#727d16", "#af87e0", "#445a06", "#cd81c7", "#a6b75b", "#6a4891", "#c6b460", "#3a6eb0", "#aa8226", "#8366ad", "#5e7222", "#ab5496", "#347f4e", "#ed6993", "#44976e", "#c45386", "#7dc49a", "#ae3946", "#31abb2", "#e6665e", "#55a6d8", "#a75f22", "#377da9", "#e68561", "#1a6447", "#ed8eb6", "#296437", "#c0aaee", "#6a6511", "#908ccd", "#8c8f3d", "#5a5f94", "#e2a86b", "#8e5888", "#476025", "#d598c7", "#63510a", "#ae739f", "#6c8548", "#973763", "#31816a", "#a34a2c", "#aeb579", "#bc648b", "#5e622c", "#e38988", "#796626", "#864863", "#8f844a", "#95454d", "#865e1c", "#b86262", "#b47f50", "#865630"],
  }),
  props: {
    unique: {
      type: String,
      required: true,
    },
    rad_factor: {
      type: Number,
      required: false,
      default: 6,
    },
    chart: {
      type: Object,
      required: false,
      default: null,
    },
    color_map: {
      type: Array,
      required: false,
      default: () => [],
    },
    levels: {
      type: Number,
      required: false,
      default: 3,
    },
    unit: {
      type: String,
      required: false,
      default: "",
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
  },
  mounted() {
    this.createViewport();
    this.onResize();
    setTimeout(() => this.onResize(), 500);
  },
  methods: {
    createViewport() {
      const [viewport] = this.$el.getElementsByClassName(this.unique);
      this.viewport = viewport;
      let area = this.getSize();

      this.rootsvg = d3_select(viewport).append("svg").attr("font-family", "roboto").style("overflow", "hidden").attr("class", `root-${this.unique}`).attr("width", area.width).attr("height", area.height).attr("preserveAspectRatio", "none");
    },
    getSize() {
      if (this.viewport) {
        this.width = this.viewport.clientWidth;
        this.height = this.viewport.clientHeight;
        return { width: this.width, height: this.height };
      }

      this.width = 0;
      this.height = 0;
      return { width: this.width, height: this.height };
    },

    nameToColor(name) {
      let found = this.color_map.find((f) => f.name == name);

      if (found) {
        return found.color;
      }

      let hash = this.hashStr(name);
      let index = hash % this.palette.length;
      return this.palette[index];
    },
    hashStr(str) {
      if (!str) {
        str = String(str);
      }
      var hash = 0;
      for (var i = 0; i < str.length; i++) {
        var charCode = str.charCodeAt(i);
        hash += charCode;
      }
      return hash;
    },

    getRandomColor() {
      let letters = "0123456789ABCDEF";
      let color = "#";
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    getColor(name) {
      // switch (name) {
      //   case "Pending":
      //     return this.$vuetify.theme.currentTheme.pending;
      //   case "Terminiating":
      //     return this.$vuetify.theme.currentTheme.warning;
      //   case "ip":
      //     return this.$vuetify.theme.currentTheme.warning;
      //   case "Not Ready":
      //     return this.$vuetify.theme.currentTheme.warning;
      //   case "Used":
      //     return this.$vuetify.theme.currentTheme.warning;
      //   case "Allocatable":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "up":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "Running":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "Ready":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "completed":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "Succeeded":
      //     return this.$vuetify.theme.currentTheme.success;
      //   case "Failed":
      //     return this.$vuetify.theme.currentTheme.error;
      //   case "down":
      //     return this.$vuetify.theme.currentTheme.error;
      //   case "Unknown":
      //     return this.$vuetify.theme.currentTheme.warning;
      //   case "all":
      //     return "currentColor";
      //   default:
      //     // return "currentColor";
      //     break;
      // }
      return this.nameToColor(name);
    },
    getColorDepth(name, depth) {
      let c = this.getColor(name);
      let hsl = d3_hsl(c);
      hsl.opacity = 1 - depth * 0.1;
      return hsl;
    },
    nice_key_text(name) {
      return name;
    },
    _groupBy() {
      let chart = this.chart;
      if (!chart) return null;

      let data = chart.data;
      if (!data) {
        return [];
      }
      let gby = this.chart.groupBy;
      let gdata = [];
      for (let id = 0; id < data.length; id++) {
        const oid = data[id];
        // console.log(`floSunburstBasic - oid:${JSON.stringify(oid)}`);
        let l_it = null;
        for (let ig = 0; ig < gby.length; ig++) {
          const oig = gby[ig];
          const oign = oid[oig];
          // console.log(`floSunburstBasic - gby - oig:${oig} - oign:${oign}`);
          if (null == l_it) {
            // console.log(`floSunburstBasic - no it - ogin:${oign}`);
            l_it = gdata.find((f) => {
              // console.log(`floSunburstBasic - find - is oign: ${oign} key:${f.key}`);
              return oign == f.key;
            });

            if (!l_it) {
              // console.log(`floSunburstBasic - no it - NOT found - ogin:${oign}`);
              if (ig + 1 < gby.length) {
                // console.log(`floSunburstBasic - no it - add - values for ogin:${oign}`);
                l_it = {
                  key: oign,
                  values: [],
                };
              } else {
                // console.log(`floSunburstBasic - no it - add - value for ogin:${oign}`);
                l_it = {
                  key: oign,
                  value: oid[chart.valueBy],
                };
              }

              gdata.push(l_it);
            }

            // console.log(`floSunburstBasic - _groupBy - no it continue - gdata: ${JSON.stringify(gdata)}`);

            continue;
          }

          if (l_it.hasOwnProperty("values")) {
            // console.log(`floSunburstBasic - it - ${l_it.key} has - values`);
            let l_values = l_it.values;
            // console.log(`floSunburstBasic - it - find - oign: ${oign}`);
            l_it = l_values.find((f) => oign == f.key);

            if (!l_it) {
              // console.log(`floSunburstBasic - it - NOT found ogin:${oign}`);
              if (ig + 1 < gby.length) {
                // console.log(`floSunburstBasic - it - add - values for ogin:${oign}`);
                l_it = {
                  key: oign,
                  values: [],
                };
              } else {
                // console.log(`floSunburstBasic - it - add - value for ogin:${oign}`);
                l_it = {
                  key: oign,
                  value: oid[chart.valueBy],
                };
              }
              // console.log(`floSunburstBasic - it - push - ${JSON.stringify(l_it)}`);
              l_values.push(l_it);
            } else if (l_it.hasOwnProperty("value")) {
              // console.log(`floSunburstBasic - it found ${oign} has - value`);
              // console.log(`floSunburstBasic - sum value - b - l_it.value: ${l_it.value} + ${oid[chart.valueBy]}`);
              l_it.value = l_it.value + oid[chart.valueBy];
              // console.log(`floSunburstBasic - sum value - a - l_it.value: ${l_it.value}`);
            } else {
              // console.log(`floSunburstBasic - ${oign} has - NADA`);
            }
          }

          // console.log(`floSunburstBasic - _groupBy - it - gdata: ${JSON.stringify(gdata)}`);
          // console.log(gdata);
        }
      }

      // console.log(`floSunburstBasic - _groupBy - gdata: ${JSON.stringify(gdata)}`);
      // console.log(gdata);
      let packDatas = { key: "all", values: gdata };
      let preroot = d3_hierarchy(packDatas, (d) => d.values).sum((d) => {
        return d.value;
      });

      let proot = d3_partition().size([2 * Math.PI, preroot.height + 1])(preroot);
      proot.each((d) => (d.current = d));
      this.chart["proot"] = proot;

      return gdata;
    },

    drawChart(chart) {
      // console.log(chart);
      let proot = chart.proot;

      let color = this.getColor;
      let color_depth = this.getColorDepth;

      let nice_key_text = this.nice_key_text;

      let area = this.getSize();
      let width = area.width;
      let height = area.height;
      let lrad = Math.min(area.width, area.height) / this.rad_factor;
      let margin = chart.area.margin;
      let l_visible_levels = this.levels;
      let l_actaul_labels = l_visible_levels;

      if (chart.hasOwnProperty("groupBy")) {
        l_actaul_labels = chart.groupBy.length;
      }

      let unique = this.unique;
      let unit = this.unit;

      let rootsvg = d3_select(this.viewport)
        .select("svg")
        .attr("viewBox", [-margin.left, -margin.top, width + (margin.left + margin.right), height + (margin.top + margin.bottom)])
        .attr("width", width)
        .attr("height", height);
      // .style("font", "10px roboto");

      rootsvg.selectAll("g").remove();

      this.rootsvg = rootsvg;

      // we add our first graphics
      const draw = rootsvg.append("g").attr("transform", `translate(${this.width / 2},${this.height / 2})`);

      // draw center text
      if (!proot || 0 == proot.value) {
        // draw "No Activity"
        // draw center circle
        const _parent = draw
          .append("circle")
          .attr("r", Math.min(area.width, area.height) / 3)
          .attr("fill", "orange");

        // draw center text
        const _center_circle = draw
          .append("text")
          .attr("x", 0)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .attr("fill-opacity", "0.6")
          .attr("font-size", 20)
          .attr("fill", "white")
          .style("user-select", "none")
          .attr("text-anchor", "middle")
          .text(function () {
            return "No Activity";
          });

        return;
      }

      // draw center text
      const center_text = draw
        .append("text")
        .datum(proot)
        .attr("x", 0)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .attr("font-size", (d) => center_fs(node_stats_text(d)))
        .attr("fill-opacity", "0.6")
        .attr("fill", "currentColor")
        .style("user-select", "none")
        .attr("text-anchor", "middle")
        .text((d) => node_stats_text(d));

      // draw slices
      const slice_path = draw
        .append("g")
        .selectAll("path")
        .data(proot.descendants().slice(1))
        .join("path")
        .attr("id", (d) => {
          return `arc_${make_unique_id(d)}`;
        })
        .attr("fill", (d) => {
          while (d.depth > 1) {
            d = d.parent;
          }
          return color(d.data.key);
        })
        .attr("fill-opacity", (d) => (is_arc_visible(d.current) ? (d.children ? 0.8 : 0.6) : 0)) // new
        .attr("d", (d) => draw_arc(d.current));

      // draw slices labels path
      const slice_label_path = draw
        .append("g")
        .selectAll("path")
        .data(proot.descendants().slice(1))
        .join("path")
        .attr("id", (d) => {
          return `parc_${make_unique_id(d)}`;
        })
        .attr("fill-opacity", (d) => (is_arc_visible(d.current) ? (d.children ? 0.8 : 0.6) : 0)) // new
        .attr("d", (d) => draw_arc_mid(d.current));

      slice_path.style("cursor", "pointer").on("click", clicked);

      // draw center circle (must be last to it can get the click events)
      const center_circle = draw.append("circle").datum(proot).attr("r", lrad).attr("fill", "None").attr("pointer-events", "all").on("click", clicked);

      // draw slices labels on slices labels path (must be last to it can get the click events)
      const slice_label = draw
        .append("g")
        .attr("pointer-events", "none")
        .attr("text-anchor", "middle")
        .style("user-select", "none")
        .selectAll("text")
        .data(proot.descendants().slice(1))
        .join("text")
        .attr("fill", "currentColor")
        .attr("text-anchor", "middle")
        .attr("fill-opacity", (d) => +is_label_visible(d.current))
        .append("textPath")
        .attr("xlink:href", (d) => `#parc_${make_unique_id(d)}`)
        .attr("startOffset", (d) => {
          return updown(d.current);
        })
        .attr("font-size", (d) => label_fs(d.current, nice_key_text(d.data.key)))
        .text((d) => `${nice_key_text(d.data.key)}`);

      function updown(i) {
        let x0 = i.x0;
        let x1 = i.x1;
        let flip = x0 > x1;

        let sum = 0;
        if (flip) {
          sum = x0 + x1 + Math.PI;
        } else {
          sum = x0 + x1;
        }

        let avg = sum / 2;

        if ((avg <= Math.PI * 2 && avg >= Math.PI * 1.5) || (avg <= Math.PI / 2 && avg >= 0)) {
          return "75%";
        } else {
          return "25%";
        }
      }

      function is_arc_visible(i) {
        // orig code
        // console.log(`is_arc_visible - y0:${i.y0} y1:${i.y1} v:${l_visible_levels} a:${l_actaul_labels}`)
        // console.log(i)
        // if (d.hasOwnProperty("depth")) {
        //   if (d.depth < l_visible_levels) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // }
        // return d.y1 <= levels && d.y0 >= 1 && d.x1 > d.x0;
        // if (i.y1 > l_visible_levels) {
        //   return false;
        // }
        return i.y1 <= l_visible_levels && i.y0 >= 0 && i.x1 > i.x0;
      }
      function is_label_visible(i) {
        // orig code
        // return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        // if (d.hasOwnProperty("depth")) {
        //   if (d.depth > l_visible_levels) {
        //     return true;
        //   } else {
        //     return false;
        //   }
        // }

        return i.y1 <= l_visible_levels && i.y0 >= 1 && i.x1 > i.x0;
      }

      function center_fs(p_text) {
        // console.log(p_text);
        let l_txt = p_text; //node_stats_text(d);

        let l_pix_needed = 16;
        if (l_txt.length) {
          l_pix_needed = Math.floor((lrad * 2 * 2) / l_txt.length);
        }
        // console.log(`center_fs - rad: ${lrad} len:${l_txt.length} pxn: ${l_pix_needed}`);

        // if (l_pix_needed > 16) {
        //   l_pix_needed = 16;
        // } else

        if (l_pix_needed < 12) {
          l_pix_needed = 12;
        }

        return l_pix_needed;
        // const l_fs_max = 16;
        // const l_fs_min = 12;
        // let l_fs = l_fs_max;
        // // console.log(l_txt.length);
        // if (l_txt.length <= 8) {
        //   l_fs = l_fs_max;
        // } else if (l_txt.length > 8 && l_txt.length <= 16) {
        //   l_fs = l_fs_min + ((l_txt.length - 8) / 2);
        // } else if (l_txt.length > 16) {
        //   l_fs = l_fs_min;
        // }
        // console.log(l_fs);
        // return l_fs;
      }
      function label_fs(i, name) {
        // let i = d.current;
        // let l_in_rad = Math.max(i.y0 * lrad);
        // let l_out_rad = Math.max(i.y0 * lrad, i.y1 * lrad - 1);

        // console.log(`label_fs - name: ${name}`);
        // console.log(i);
        // if (!i.hasOwnProperty("data")) {
        //   return 0;
        // }
        // The arc length formula in radians can be expressed as, arc length = θ × r, when θ is in radian. Arc Length = θ × (π/180) × r, where θ is in degree, where,
        // L = Length of an Arc
        // θ = Central angle of Arc
        // r = Radius of the circle

        let inr = i.y0 * lrad;
        let outr = Math.max(i.y0 * lrad, i.y1 * lrad - 1);
        let r = inr + (outr - inr) / 2;

        let l_ang = i.x0 > i.x1 ? i.x0 - i.x1 : i.x1 - i.x0;
        let l_str_len = name.length;
        // let l_dep = i.depth;
        // const l_angle_factor = 10.0;
        // const l_depth_factor = 1.0;
        // let l_radius = Math.max(i.y0 * lrad, i.y1 * lrad - 1)
        // let l_radius = i.y0 * lrad * 1.5;
        let l_radius = r;

        let l_arc_len = l_ang * l_radius;
        // padding
        // if (l_arc_len > 40) {
        //   l_arc_len - 40;
        // }
        l_arc_len *= 0.8;

        let l_pixels_needed = l_arc_len / l_str_len;
        // console.log(`label_fs - name: ${name}, a: ${l_ang}, ir: ${inr}, or: ${outr}, r: ${r}, sl: ${l_str_len}, al: ${l_arc_len}, pxn:${l_pixels_needed}`);

        l_pixels_needed = Math.floor(l_pixels_needed) * 2;
        // if (l_pixels_needed > 4) {
        //   l_pixels_needed -= 4;
        // }

        if (l_pixels_needed > 16.0) {
          l_pixels_needed = 16;
        }
        // else {
        //   l_pixels_needed = Math.floor(l_pixels_needed) * 2;
        // }
        // console.log(`label_fs - final pxn:${l_pixels_needed}`);

        // console.log(`label_fs - name: ${name}, d:${depth}, X0,Y0:${i.x0}:${i.y0}, X1,Y1:${i.x1}:${i.y1}, a:${l_ang}, sl:${l_str_len}, al: ${l_arc_len}, pxn:${l_pixels_needed}`);

        return l_pixels_needed; //10 + Math.floor(l_ang);
      }

      function draw_arc(i) {
        if (typeof i === "undefined") return "M0,-100A100,100,0,0,1,100,0L0,0Z";
        let larc = d3_arc()
          .startAngle(i.x0)
          .endAngle(i.x1)
          .padAngle(Math.min((i.x1 - i.x0) / 2, 0.005))
          .padRadius(lrad * 1.5)
          .innerRadius(i.y0 * lrad)
          .outerRadius(Math.max(i.y0 * lrad, i.y1 * lrad - 1));
        // console.log(larc);
        return larc();
      }
      function draw_arc_mid(i) {
        if (typeof i === "undefined") return "M0,-100A100,100,0,0,1,100,0L0,0Z";
        let inr = i.y0 * lrad;
        let outr = Math.max(i.y0 * lrad, i.y1 * lrad - 1);
        let r = inr + (outr - inr) / 2;
        let larc = d3_arc().startAngle(i.x1).endAngle(i.x0).padAngle(0).padRadius(0).innerRadius(r).outerRadius(r);
        return larc();
      }

      function make_unique_id(d) {
        if (!d) {
          return d;
        }

        let s = `${unique}`;
        while (d.depth > 0) {
          s += `@${d.data.key}`;
          d = d.parent;
        }

        return s;
      }

      function node_stats_text(n) {
        if (!n.hasOwnProperty("data")) {
          return "";
        }
        return `${Math.floor(n.value)} ${n.data.key} ${unit}`;
      }

      // function getMid(d) {
      //   const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      //   const y = ((d.y0 + d.y1) / 2) * lrad; //this.radius;
      //   return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      // }

      // function labelTransform(d) {
      //   const x = (((d.x0 + d.x1) / 2) * 180) / Math.PI;
      //   const y = ((d.y0 + d.y1) / 2) * lrad; //this.radius;
      //   return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      // }

      // function format(i) {
      //   let lformat = d3_format(",d");
      //   return lformat(i);
      // }

      function clicked(event, p) {
        if (p.parent) {
          center_circle.datum(p.parent);
        } else {
          center_circle.datum(proot);
        }

        proot.each(
          (d) =>
            (d.target = {
              x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
              y0: Math.max(0, d.y0 - p.depth),
              y1: Math.max(0, d.y1 - p.depth),
            }),
        );

        const t = draw.transition().duration(750);

        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        slice_path
          .transition(t)
          .tween("data", (d) => {
            const i = d3_interpolate(d.current, d.target);
            return (t) => (d.current = i(t));
          })
          .filter((d) => {
            // return +this.getAttribute("fill-opacity") || is_arc_visible(d.target);

            // return +this.getAttribute("fill-opacity") > 0.0 || is_arc_visible(d.target);
            let l_has_opacity = false;
            let l_opacity_val = this.getAttribute("fill-opacity");
            if (l_opacity_val) {
              l_has_opacity = +l_opacity_val > 0.0;
            } else {
              null == l_opacity_val;
            }
            {
              // console.log(`slice_path - is null`);
              l_has_opacity = true;
            }
            // console.log(`slice_path - filter - fill-opacity: ${this.getAttribute("fill-opacity")} is_arc_visible: ${is_arc_visible(d.target)} l_has_opacity:${l_has_opacity}`);
            return l_has_opacity || is_arc_visible(d.target);

            // return +this.getAttribute("fill-opacity") > 0.0;
            // return is_arc_visible(d.target);
          })
          // .attr("fill-opacity", (d) => (is_arc_visible(d.target) ? (d.children ? 0.6 : 0.4) : 0)) // old
          .attr("fill-opacity", (d) => (is_arc_visible(d.target) ? (d.children ? 0.6 : 0.4) : 0)) // old
          .attrTween("d", (d) => () => draw_arc(d.current));

        slice_label_path
          .transition(t)
          .tween("data", (d) => {
            const i = d3_interpolate(d.current, d.target);
            return (t) => (d.current = i(t));
          })
          .filter((d) => {
            let l_has_opacity = false;
            let l_opacity_val = this.getAttribute("fill-opacity");
            if (l_opacity_val) {
              l_has_opacity = +l_opacity_val > 0.0;
            } else {
              null == l_opacity_val;
            }
            {
              l_has_opacity = true;
            }

            return l_has_opacity || is_arc_visible(d.target);
          })
          // .attr("fill-opacity", (d) => (is_arc_visible(d.target) ? (d.children ? 0.6 : 0.4) : 0)) // old
          .attr("fill-opacity", (d) => (is_arc_visible(d.target) ? (d.children ? 0.6 : 0.4) : 0)) // old
          // .attr("fill-opacity", (d) => (d.children ? 0.6 : 0.4)) // old
          .attrTween("d", (d) => () => draw_arc_mid(d.current));

        slice_label
          .attr("font-size", (d) => label_fs(d.target, nice_key_text(d.data.key)))
          .attr("fill-opacity", (d) => +is_label_visible(d.target))
          .attr("startOffset", (d) => {
            return updown(d.target);
          });

        center_text
          .attr("font-size", center_fs(node_stats_text(p)))
          .text(node_stats_text(p))
          .attr("fill", "currentColor");
      }
    },
    onResize() {
      if (this.rootsvg === null) return;
      this.drawChart(this.chart);
    },
  },
  created() {
    this._groupBy();
    this.palette[0] = this.$vuetify.theme.currentTheme.info;
    this.palette[1] = this.$vuetify.theme.currentTheme.success;
    this.palette[2] = this.$vuetify.theme.currentTheme.warning;
    this.palette[3] = this.$vuetify.theme.currentTheme.error;
  },
};
</script>
