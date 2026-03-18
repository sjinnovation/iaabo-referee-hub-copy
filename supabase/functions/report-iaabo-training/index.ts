import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const IAABO_SOAP_URL = "https://iaabo.refsec.com/Web/iaaboservices.asmx";
const SOAP_ACTION = "http://board33.refsec.com/AddTrainingClass";

const ALLOWED_BEARER_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indid2V2cG1jdXZhd3lrZnlyeHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NTA0MjcsImV4cCI6MjA4NzQyNjQyN30.aNSK_xoj7cyPPcYubEoO5YvG-_ZH44dKBywm9CCXrso";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeXml(str: string): string {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSoapEnvelope(params: {
  iaaboId: string;
  email: string;
  firstName: string;
  lastName: string;
  courseName: string;
  courseId: string;
  startDate: string;
  completionDate: string;
  expirationDate?: string;
  testScore?: string;
  comments?: string;
}): string {
  const el = (name: string, value: string) =>
    value ? `<${name}>${escapeXml(value)}</${name}>` : "";
  const ns = "http://board33.refsec.com";
  const body = `
    <AddTrainingClass xmlns="${ns}">
      <AddTraining>
        ${el("IaaboId", params.iaaboId)}
        ${el("Email", params.email)}
        ${el("FirstName", params.firstName)}
        ${el("LastName", params.lastName)}
        ${el("CourseName", params.courseName)}
        ${el("CourseId", params.courseId)}
        ${el("StartDate", params.startDate)}
        ${el("CompletionDate", params.completionDate)}
        ${el("ExpirationDate", params.expirationDate ?? "")}
        ${el("TestScore", params.testScore ?? "")}
        ${el("Comments", params.comments ?? "")}
      </AddTraining>
    </AddTrainingClass>`;
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>${body}
  </soap:Body>
</soap:Envelope>`;
}

interface ReportTrainingPayload {
  memberIaaboId: string;
  courseIaaboId: string;
  courseName: string;
  startDate: string;
  completionDate: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  totalScore?: number;
  maxScore?: number;
  passed?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const authHeader = req.headers.get("Authorization");
  if (authHeader !== `Bearer ${ALLOWED_BEARER_TOKEN}`) {
    return new Response(
      JSON.stringify({ code: 401, message: "Missing authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const payload: ReportTrainingPayload = await req.json();

    const { memberIaaboId, courseIaaboId, courseName, startDate, completionDate, email, firstName, lastName, totalScore, maxScore, passed } =
      payload;

    if (!memberIaaboId || !courseIaaboId || !startDate || !completionDate) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: memberIaaboId, courseIaaboId, startDate, completionDate",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let testScore = "";
    if (totalScore != null && maxScore != null && passed != null) {
      testScore = `${totalScore}/${maxScore} (${passed ? "pass" : "fail"})`;
    }

    const soapParams = {
      iaaboId: memberIaaboId,
      email: email ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      courseName: courseName ?? "",
      courseId: courseIaaboId,
      startDate,
      completionDate,
      testScore: testScore || undefined,
    };

    console.log("report-iaabo-training: Payload received from client:", JSON.stringify(payload, null, 2));
    console.log("report-iaabo-training: Sending to IAABO API:", JSON.stringify(soapParams, null, 2));

    const soapBody = buildSoapEnvelope(soapParams);

    const soapResponse = await fetch(IAABO_SOAP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: SOAP_ACTION,
      },
      body: soapBody,
    });

    const responseText = await soapResponse.text();

    if (!soapResponse.ok) {
      console.error("IAABO SOAP error:", soapResponse.status, responseText);
      return new Response(
        JSON.stringify({
          error: "IAABO API request failed",
          status: soapResponse.status,
          details: responseText.slice(0, 500),
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Training reported to IAABO successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("report-iaabo-training error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
