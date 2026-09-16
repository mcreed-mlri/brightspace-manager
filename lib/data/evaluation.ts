import "server-only";

import { mockResult } from "@/lib/data/envelope";
import { mockEvaluationReport } from "@/lib/fixtures/evaluation";
import type { DataResult, EvaluationReport } from "@/types/domain";

/* Operator evaluation rollup. This intentionally returns illustrative data until
   Brightspace progress and hub feedback are connected into live reporting. */
export async function getEvaluationReport(): Promise<DataResult<EvaluationReport>> {
  return mockResult(mockEvaluationReport, "Evaluation");
}
