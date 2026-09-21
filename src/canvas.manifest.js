export const manifest = {
  screens: {
    scr_ydzoyk: { name: "Sign in", route: "/login", state: { "screenUser": null }, position: { "x": 160, "y": 1820 } },
    scr_uawyqm: { name: "Dashboard (Admin)", route: "/", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 160, "y": 3800 } },
    scr_g18stk: { name: "Dashboard (Staff)", route: "/", state: { "screenUser": "james.okafor@nexus.com" }, position: { "x": 1560, "y": 3800 } },
    scr_dbkgrp: { name: "Missions", route: "/missions", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 160, "y": 5780 } },
    scr_01nn6z: { name: "New mission", route: "/missions", state: { "screenUser": "amara.okoye@nexus.com", "createOpen": true }, position: { "x": 1560, "y": 5780 } },
    scr_qvtuuu: { name: "Mission detail", route: "/missions/m-1042", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 2960, "y": 5780 } },
    scr_tfinjv: { name: "Approvals", route: "/approvals", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 160, "y": 7760 } },
    scr_o3gjcm: { name: "Activity Reports", route: "/activity-reports", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 160, "y": 9740 } },
    scr_s3imuy: { name: "Vehicle Requests", route: "/vehicle-requests", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 1560, "y": 9740 } },
    scr_8kwwio: { name: "Mileage Claims", route: "/mileage-claims", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 2960, "y": 9740 } },
    scr_da5bq1: { name: "Settlement", route: "/settlement", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 4360, "y": 9740 } },
    scr_q9ybur: { name: "Users", route: "/users", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 160, "y": 11720 } },
    scr_dlt5sl: { name: "Page not found", route: "/404", state: { "screenUser": "amara.okoye@nexus.com" }, position: { "x": 0, "y": 0 }, isDefaultRow: true }
  },
  sections: {
    sec_53gqkb: { name: "Authentication", x: 0, y: 1600, width: 1520, height: 1180 },
    sec_ck1k4u: { name: "Dashboards", x: 0, y: 3580, width: 2920, height: 1180 },
    sec_3oo76s: { name: "Missions", x: 0, y: 5560, width: 4320, height: 1180 },
    sec_ovjq8r: { name: "Approvals", x: 0, y: 7540, width: 1520, height: 1180 },
    sec_c5zj7j: { name: "Reports & Claims", x: 0, y: 9520, width: 5720, height: 1180 },
    sec_hd177r: { name: "Administration", x: 0, y: 11500, width: 1520, height: 1180 }
  },
  layers: [
  { kind: "screen", id: "scr_dlt5sl" },
  { kind: "section", id: "sec_53gqkb", children: [
    { kind: "screen", id: "scr_ydzoyk" }]
  },
  { kind: "section", id: "sec_ck1k4u", children: [
    { kind: "screen", id: "scr_uawyqm" },
    { kind: "screen", id: "scr_g18stk" }]
  },
  { kind: "section", id: "sec_3oo76s", children: [
    { kind: "screen", id: "scr_dbkgrp" },
    { kind: "screen", id: "scr_01nn6z" },
    { kind: "screen", id: "scr_qvtuuu" }]
  },
  { kind: "section", id: "sec_ovjq8r", children: [
    { kind: "screen", id: "scr_tfinjv" }]
  },
  { kind: "section", id: "sec_c5zj7j", children: [
    { kind: "screen", id: "scr_o3gjcm" },
    { kind: "screen", id: "scr_s3imuy" },
    { kind: "screen", id: "scr_8kwwio" },
    { kind: "screen", id: "scr_da5bq1" }]
  },
  { kind: "section", id: "sec_hd177r", children: [
    { kind: "screen", id: "scr_q9ybur" }]
  }]

};