"use client";

// ============================================================================
// LibraryCanvas —— 右栏「库」四分区统一封装（宗旨 v17，操作员 2026-07-07）。
// ----------------------------------------------------------------------------
// 各引擎（开发信 / 公司调研 / 竞品分析 / 外贸翻译…）把自己的「生成结果」标签页传进来，
// 本组件在其后统一补上「素材库(MaterialLibrary) + 文件库(ArtifactLibrary)」两分区，并
// 自管标签切换状态。「导航」分区由 ResultCanvas 依 SiteCatalogConsole 传入的 guide 自动
// 前插。于是每个引擎右栏都齐四分区：导航 / 生成结果 / 素材库 / 文件库。
// ============================================================================

import { useState } from "react";
import {
  ResultCanvas,
  MaterialLibrary,
  ArtifactLibrary,
  type CanvasTab,
} from "@oceanleo/ui/shell";
import { MATERIALS } from "@/lib/materials";

const ACCENT = "#0e7490";

export function LibraryCanvas({
  resultTabs,
  accent = ACCENT,
}: {
  resultTabs: CanvasTab[];
  accent?: string;
}) {
  const [view, setView] = useState(resultTabs[0]?.id ?? "result");
  const tabs: CanvasTab[] = [
    ...resultTabs,
    {
      id: "material",
      label: "素材库",
      content: <MaterialLibrary materials={MATERIALS} accent={accent} />,
    },
    { id: "files", label: "文件库", content: <ArtifactLibrary accent={accent} fill /> },
  ];
  return <ResultCanvas tabs={tabs} active={view} onChange={setView} accent={accent} />;
}
