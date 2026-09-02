import "server-only";

import { mockResult } from "@/lib/data/envelope";
import { mockEvaluationReport } from "@/lib/fixtures/evaluation";
import type { DataResult, EvaluationReport } from "@/types/domain";

/* Framework demonstration data for Operator reporting. This intentionally
   returns mock data until Brightspace progress and hub feedback are connected
   into a live reporting rollup. */
export async function getEvaluationReport(): Promise<DataResult<EvaluationReport>> {
  return mockResult(mockEvaluationReport, "Evaluation Framework");
}
