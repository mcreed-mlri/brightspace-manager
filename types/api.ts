import type { DataSource } from "@/types/domain";

/* Every API route returns one of these. Errors never echo env values. */

export type ApiOk<T> = {
  ok: true;
  data: T;
  source: DataSource;
  fetchedAt: string;
};

export type ApiErr = {
  ok: false;
  error: {
    message: string;
    status?: number;
  };
};

export type ApiResponse<T> = ApiOk<T> | ApiErr;
