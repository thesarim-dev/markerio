export const manifest = {
  screens: {
    scr_2prcmn: { name: "Exams Dashboard", route: "/", state: { "view": { "name": "dashboard" } }, position: { "x": 160, "y": 220 } },
    scr_am701l: { name: "Create Exam Master", route: "/", state: { "view": { "name": "create_exam" } }, position: { "x": 1560, "y": 220 } },
    scr_waixtj: { name: "Exam Detail", route: "/", state: { "view": { "name": "exam_detail", "examId": "exam-1" } }, position: { "x": 2960, "y": 220 } },
    scr_dun2b9: { name: "Capture Pages", route: "/", state: { "view": { "name": "capture", "examId": "exam-1" } }, position: { "x": 160, "y": 2200 } },
    scr_rg1syj: { name: "AI Diagnostic Report", route: "/", state: { "view": { "name": "report", "reportId": "rep-1" } }, position: { "x": 1560, "y": 2200 } },
    scr_xvi92c: { name: "All Reports", route: "/", state: { "view": { "name": "reports_list" } }, position: { "x": 2960, "y": 2200 } }
  },
  sections: {
    sec_cgblji: { name: "Exam Management", x: 0, y: 0, width: 4320, height: 1180 },
    sec_xq246v: { name: "Analysis & Reporting", x: 0, y: 1980, width: 4320, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_cgblji", children: [
    { kind: "screen", id: "scr_2prcmn" },
    { kind: "screen", id: "scr_am701l" },
    { kind: "screen", id: "scr_waixtj" }]
  },
  { kind: "section", id: "sec_xq246v", children: [
    { kind: "screen", id: "scr_dun2b9" },
    { kind: "screen", id: "scr_rg1syj" },
    { kind: "screen", id: "scr_xvi92c" }]
  }]

};