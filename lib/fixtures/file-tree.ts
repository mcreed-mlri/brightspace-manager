import type { FileNode } from "@/types/domain";

/* Mock Manage Files tree for org unit 6703, following the LACE course
   package convention (Home.html + topic pages + shared wrapper assets). */

export const mockFileTree: FileNode = {
  name: "Course-Files",
  path: "/",
  kind: "folder",
  children: [
    {
      name: "Home.html",
      path: "/Home.html",
      kind: "file",
      sizeBytes: 14_208,
      modifiedAt: "2026-05-28T14:32:00Z",
    },
    {
      name: "01-intake.html",
      path: "/01-intake.html",
      kind: "file",
      sizeBytes: 22_410,
      modifiedAt: "2026-05-28T14:35:00Z",
    },
    {
      name: "02-notice-to-quit.html",
      path: "/02-notice-to-quit.html",
      kind: "file",
      sizeBytes: 19_876,
      modifiedAt: "2026-05-28T14:36:00Z",
    },
    {
      name: "03-summary-process.html",
      path: "/03-summary-process.html",
      kind: "file",
      sizeBytes: 25_104,
      modifiedAt: "2026-06-02T09:18:00Z",
    },
    {
      name: "complete.html",
      path: "/complete.html",
      kind: "file",
      sizeBytes: 8_932,
      modifiedAt: "2026-05-28T14:38:00Z",
    },
    {
      name: "course-config.js",
      path: "/course-config.js",
      kind: "file",
      sizeBytes: 4_215,
      modifiedAt: "2026-06-02T09:20:00Z",
    },
    {
      name: "course-nav.js",
      path: "/course-nav.js",
      kind: "file",
      sizeBytes: 31_540,
      modifiedAt: "2026-05-12T10:02:00Z",
    },
    {
      name: "course-style.css",
      path: "/course-style.css",
      kind: "file",
      sizeBytes: 27_366,
      modifiedAt: "2026-05-12T10:02:00Z",
    },
    {
      name: "images",
      path: "/images",
      kind: "folder",
      children: [
        {
          name: "notice-timeline.png",
          path: "/images/notice-timeline.png",
          kind: "file",
          sizeBytes: 148_220,
          modifiedAt: "2026-05-28T14:30:00Z",
        },
        {
          name: "courtroom-map.png",
          path: "/images/courtroom-map.png",
          kind: "file",
          sizeBytes: 203_114,
          modifiedAt: "2026-05-28T14:30:00Z",
        },
        {
          name: "answer-form-callouts.png",
          path: "/images/answer-form-callouts.png",
          kind: "file",
          sizeBytes: 176_905,
          modifiedAt: "2026-06-02T09:15:00Z",
        },
      ],
    },
    {
      name: "assets",
      path: "/assets",
      kind: "folder",
      children: [
        {
          name: "summary-process-answer-blank.pdf",
          path: "/assets/summary-process-answer-blank.pdf",
          kind: "file",
          sizeBytes: 412_038,
          modifiedAt: "2026-05-28T14:28:00Z",
        },
      ],
    },
  ],
};
