import type { FileNode } from "@/types/domain";

/* Mock Manage Files trees following the LACE course package convention
   (Home.html + topic pages + shared wrapper assets). Org unit 6703 has a
   detailed tree; other org units get a generic package so the course
   picker has something realistic to show. */

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

const WRAPPER_FILES: FileNode[] = [
  {
    name: "course-config.js",
    path: "/course-config.js",
    kind: "file",
    sizeBytes: 3_120,
    modifiedAt: "2026-05-20T11:00:00Z",
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
];

export function mockFileTreeFor(orgUnitId: number): FileNode {
  if (orgUnitId === 6703) return mockFileTree;
  return {
    name: "Course-Files",
    path: "/",
    kind: "folder",
    children: [
      {
        name: "Home.html",
        path: "/Home.html",
        kind: "file",
        sizeBytes: 11_840,
        modifiedAt: "2026-05-20T11:00:00Z",
      },
      {
        name: "01-overview.html",
        path: "/01-overview.html",
        kind: "file",
        sizeBytes: 18_204,
        modifiedAt: "2026-05-20T11:02:00Z",
      },
      {
        name: "02-practice.html",
        path: "/02-practice.html",
        kind: "file",
        sizeBytes: 20_115,
        modifiedAt: "2026-05-20T11:03:00Z",
      },
      {
        name: "complete.html",
        path: "/complete.html",
        kind: "file",
        sizeBytes: 8_540,
        modifiedAt: "2026-05-20T11:04:00Z",
      },
      ...WRAPPER_FILES,
      {
        name: "images",
        path: "/images",
        kind: "folder",
        children: [
          {
            name: "module-diagram.png",
            path: "/images/module-diagram.png",
            kind: "file",
            sizeBytes: 96_410,
            modifiedAt: "2026-05-20T10:55:00Z",
          },
        ],
      },
    ],
  };
}
