import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { updateLeadStatus } from "../../../../lib/leads";

export const prerender = false;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected error.";
}

function formatZodError(error: ZodError) {
  const fieldErrors: Record<string, string[]> = {};
  const formErrors: string[] = [];

  error.issues.forEach((issue) => {
    const field = issue.path[0];

    if (typeof field === "string") {
      fieldErrors[field] ??= [];
      fieldErrors[field].push(issue.message);
      return;
    }

    formErrors.push(issue.message);
  });

  return {
    fieldErrors,
    formErrors,
  };
}

export const POST: APIRoute = async ({ params, request }) => {
  const leadId = params.id;

  if (!leadId) {
    return json({ message: "Lead id is required." }, 400);
  }

  try {
    const payload = await request.json();
    const lead = await updateLeadStatus(leadId, payload);

    if (!lead) {
      return json({ message: "Lead not found." }, 404);
    }

    return json({
      lead,
      message: "Lead status updated.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return json({ message: "Request body must be valid JSON." }, 400);
    }

    if (error instanceof ZodError) {
      return json(
        {
          message: "Lead status validation failed.",
          issues: formatZodError(error),
        },
        400,
      );
    }

    return json({ message: getErrorMessage(error) }, 500);
  }
};
