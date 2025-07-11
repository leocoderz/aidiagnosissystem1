import { NextRequest, NextResponse } from "next/server";

// Add CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400, headers: corsHeaders },
    );
  }

  console.log("Tablet lookup query:", query);

  try {
    // Clean and prepare the query
    const cleanQuery = query.trim().toLowerCase();

    // Try multiple search strategies
    const searchStrategies = [
      `openfda.brand_name:"${cleanQuery}"`,
      `openfda.generic_name:"${cleanQuery}"`,
      `openfda.substance_name:"${cleanQuery}"`,
      cleanQuery, // Broad search
    ];

    let data = null;
    let lastError = null;

    for (const searchTerm of searchStrategies) {
      try {
        const url = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(searchTerm)}&limit=1`;
        console.log("Trying URL:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "User-Agent": "SympCare24-App/1.0",
          },
        });

        if (response.ok) {
          const result = await response.json();
          if (result.results && result.results.length > 0) {
            data = result;
            break;
          }
        }
      } catch (err) {
        lastError = err;
        console.log(`Search failed for: ${searchTerm}`, err);
        continue;
      }
    }

    if (data && data.results && data.results.length > 0) {
      const result = data.results[0];
      console.log("Found result:", result.openfda?.brand_name?.[0] || query);

      // Helper function to extract text from arrays
      const extractText = (field: any, maxLength = 500) => {
        if (!field) return "";
        if (Array.isArray(field)) {
          return field[0]?.substring(0, maxLength) || "";
        }
        return field.substring(0, maxLength) || "";
      };

      // Format the response with available data
      const formattedResult = {
        brand_name: result.openfda?.brand_name?.[0] || query,
        generic_name:
          result.openfda?.generic_name?.[0] ||
          result.openfda?.substance_name?.[0] ||
          "",
        substance_name: result.openfda?.substance_name?.[0] || "",
        dosage_form: result.openfda?.dosage_form?.[0] || "Various forms",
        active_ingredient: result.active_ingredient || [],
        indications_and_usage: extractText(result.indications_and_usage),
        adverse_reactions: extractText(result.adverse_reactions),
        warnings: extractText(result.warnings),
        warnings_and_cautions: extractText(result.warnings_and_cautions),
        drug_interactions: extractText(result.drug_interactions),
        dosage_and_administration: extractText(
          result.dosage_and_administration,
        ),
        contraindications: extractText(result.contraindications),
        pregnancy:
          extractText(result.pregnancy_or_breast_feeding) ||
          extractText(result.pregnancy),
        nursing_mothers: extractText(result.nursing_mothers),
      };

      return NextResponse.json(
        {
          results: [formattedResult],
          meta: {
            disclaimer:
              "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
            source: "OpenFDA",
            last_updated: new Date().toISOString(),
          },
        },
        { headers: corsHeaders },
      );
    }

    // If no results found, return basic fallback info
    console.log("No results found for:", query);
    return NextResponse.json(
      {
        results: [
          {
            brand_name: query,
            generic_name: "Information not available in database",
            substance_name: "",
            dosage_form: "Consult package insert",
            active_ingredient: [],
            indications_and_usage:
              "Please consult with a healthcare professional for specific uses and indications.",
            adverse_reactions:
              "Consult package insert or healthcare provider for side effect information.",
            warnings:
              "Always follow healthcare provider instructions and read package warnings.",
            warnings_and_cautions: "Consult healthcare provider before use.",
            drug_interactions:
              "Consult healthcare provider about potential drug interactions.",
            dosage_and_administration:
              "Follow healthcare provider instructions for proper dosage.",
            contraindications:
              "Consult healthcare provider for contraindications.",
            pregnancy:
              "Consult healthcare provider before use during pregnancy.",
            nursing_mothers:
              "Consult healthcare provider before use while breastfeeding.",
          },
        ],
        meta: {
          disclaimer:
            "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
          message:
            "Limited information available. Please consult a healthcare provider for complete information.",
          source: "Fallback information",
          last_updated: new Date().toISOString(),
        },
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    console.error("Error fetching drug information:", error);

    // Return a fallback response with basic info
    return NextResponse.json(
      {
        results: [
          {
            brand_name: query,
            generic_name: "Unable to retrieve information",
            substance_name: "",
            dosage_form: "Consult package insert",
            active_ingredient: [],
            indications_and_usage:
              "Please consult with a healthcare professional for uses and indications.",
            adverse_reactions:
              "Consult package insert or healthcare provider for side effect information.",
            warnings: "Always follow healthcare provider instructions.",
            warnings_and_cautions: "Consult healthcare provider before use.",
            drug_interactions:
              "Consult healthcare provider about drug interactions.",
            dosage_and_administration:
              "Follow healthcare provider instructions.",
            contraindications: "Consult healthcare provider.",
            pregnancy:
              "Consult healthcare provider before use during pregnancy.",
            nursing_mothers:
              "Consult healthcare provider before use while breastfeeding.",
          },
        ],
        meta: {
          disclaimer:
            "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
          error:
            "Unable to fetch complete information at this time. Please consult a healthcare provider.",
          last_updated: new Date().toISOString(),
        },
      },
      {
        status: 200, // Return 200 with fallback data instead of 500
        headers: corsHeaders,
      },
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}
