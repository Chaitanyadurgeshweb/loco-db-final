
"use server";

import { getAdmin } from "@/lib/auth";
import { analyse, MAX_BYTES, type Analysis } from "@/lib/bulk";
import { submitRequest } from "@/lib/submit";
import { reqId } from "@/lib/requests";

const CAP = 200;

type Ok = Extract<Analysis, { ok: true }>;

export type PreviewData = Pick<
  Ok,
  "summary" | "items" | "issues" | "ignored"
> & {
  fileName: string;
  counts: {
    items: number;
    issues: number;
    ignored: number;
  };
};

export type AnalyseResult =
  | { ok: true; data: PreviewData }
  | { ok: false; message: string };

export type SubmitResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

type LoadError = {
  error: string;
};

async function load(fd: FormData) {
  const admin = await getAdmin();

  if (!admin) {
    return {
      error: "You are not signed in as an administrator. Sign in again.",
    } as const;
  }

  const f = fd.get("file");

  if (!(f instanceof File) || f.size === 0) {
    return { error: "Choose an Excel file first." } as const;
  }

  if (!/\.(xlsx|xls)$/i.test(f.name)) {
    return {
      error: "Only .xlsx or .xls files are accepted.",
    } as const;
  }

  if (f.size > MAX_BYTES) {
    return {
      error: "The file is larger than 4 MB.",
    } as const;
  }

  const a = await analyse(admin.supabase, await f.arrayBuffer());

  return {
    admin,
    a,
    name: f.name.slice(0, 255),
  } as const;
}

type LoadResult = Awaited<ReturnType<typeof load>>;

function getLoadError(r: LoadResult): string | null {
  if ("error" in r && typeof r.error === "string") {
    return r.error;
  }

  return null;
}

/** Step 1: Read and validate the file. No database writes. */
export async function analyseUpload(
  fd: FormData
): Promise<AnalyseResult> {
  const r = await load(fd);

  const loadError = getLoadError(r);

  if (loadError !== null) {
    return {
      ok: false,
      message: loadError,
    };
  }

  if ("error" in r) {
    return {
      ok: false,
      message: "Unable to load the uploaded file.",
    };
  }

  if (!r.a.ok) {
    return {
      ok: false,
      message: r.a.message,
    };
  }

  const { summary, items, issues, ignored } = r.a;

  return {
    ok: true,
    data: {
      summary,
      fileName: r.name,
      items: items.slice(0, CAP),
      issues: issues.slice(0, CAP),
      ignored: ignored.slice(0, CAP),
      counts: {
        items: items.length,
        issues: issues.length,
        ignored: ignored.length,
      },
    },
  };
}

/** Step 2: Revalidate the file on the server and submit one review request. */
export async function submitUpload(
  fd: FormData
): Promise<SubmitResult> {
  const reason = String(fd.get("reason") ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim();

  if (reason.length < 5) {
    return {
      ok: false,
      message: "Enter a reason or explanation (at least 5 characters).",
    };
  }

  if (reason.length > 2000) {
    return {
      ok: false,
      message: "Use 2000 characters or fewer for the reason.",
    };
  }

  const r = await load(fd);

  const loadError = getLoadError(r);

  if (loadError !== null) {
    return {
      ok: false,
      message: loadError,
    };
  }

  if ("error" in r) {
    return {
      ok: false,
      message: "Unable to load the uploaded file.",
    };
  }

  if (!r.a.ok) {
    return {
      ok: false,
      message: r.a.message,
    };
  }

  if (r.a.items.length === 0) {
    return {
      ok: false,
      message:
        "There is nothing to submit: no new locomotives and no missing fields to fill.",
    };
  }

  const res = await submitRequest(
    r.admin.supabase,
    r.admin.user,
    "bulk_upload",
    reason,
    r.a.items,
    {
      fileName: r.name,
      summary: r.a.summary,
    }
  );

  if (!res.ok) {
    return {
      ok: false,
      message: res.message,
    };
  }

  return {
    ok: true,
    message: `Submitted successfully. Reference ${reqId(res.id)}. ${r.a.items.length.toLocaleString()} locomotive record(s) included.`,
  };
}
