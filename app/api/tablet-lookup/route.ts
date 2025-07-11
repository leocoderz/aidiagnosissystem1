import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 },
    );
  }

  try {
    // Using OpenFDA API for drug information
    const openFdaUrl = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(query)}"&limit=1`;

    let response = await fetch(openFdaUrl);
    let data = await response.json();

    // If no results with brand name, try generic name
    if (!data.results || data.results.length === 0) {
      const genericUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(query)}"&limit=1`;
      response = await fetch(genericUrl);
      data = await response.json();
    }

    // If still no results, try substance name
    if (!data.results || data.results.length === 0) {
      const substanceUrl = `https://api.fda.gov/drug/label.json?search=openfda.substance_name:"${encodeURIComponent(query)}"&limit=1`;
      response = await fetch(substanceUrl);
      data = await response.json();
    }

    // If still no results, try a broader search
    if (!data.results || data.results.length === 0) {
      const broadUrl = `https://api.fda.gov/drug/label.json?search=${encodeURIComponent(query)}&limit=1`;
      response = await fetch(broadUrl);
      data = await response.json();
    }

    if (data.results && data.results.length > 0) {
      const result = data.results[0];

      // Format the response with available data
      const formattedResult = {
        brand_name: result.openfda?.brand_name?.[0] || "",
        generic_name: result.openfda?.generic_name?.[0] || "",
        substance_name: result.openfda?.substance_name?.[0] || "",
        dosage_form: result.openfda?.dosage_form?.[0] || "",
        active_ingredient: result.active_ingredient || [],
        indications_and_usage: Array.isArray(result.indications_and_usage)
          ? result.indications_and_usage[0]
          : result.indications_and_usage || "",
        adverse_reactions: Array.isArray(result.adverse_reactions)
          ? result.adverse_reactions[0]
          : result.adverse_reactions || "",
        warnings: Array.isArray(result.warnings)
          ? result.warnings[0]
          : result.warnings || "",
        warnings_and_cautions: Array.isArray(result.warnings_and_cautions)
          ? result.warnings_and_cautions[0]
          : result.warnings_and_cautions || "",
        drug_interactions: Array.isArray(result.drug_interactions)
          ? result.drug_interactions[0]
          : result.drug_interactions || "",
        dosage_and_administration: Array.isArray(
          result.dosage_and_administration,
        )
          ? result.dosage_and_administration[0]
          : result.dosage_and_administration || "",
        contraindications: Array.isArray(result.contraindications)
          ? result.contraindications[0]
          : result.contraindications || "",
        pregnancy: Array.isArray(result.pregnancy)
          ? result.pregnancy[0]
          : result.pregnancy || "",
        nursing_mothers: Array.isArray(result.nursing_mothers)
          ? result.nursing_mothers[0]
          : result.nursing_mothers || "",
      };

      return NextResponse.json({
        results: [formattedResult],
        meta: {
          disclaimer:
            "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
          last_updated: new Date().toISOString(),
        },
      });
    }

    // If no results found, return empty results
    return NextResponse.json({
      results: [],
      meta: {
        disclaimer:
          "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
        message:
          "No information found for the specified medication. Please consult a healthcare provider.",
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching drug information:", error);

    // Return a fallback response
    return NextResponse.json(
      {
        results: [],
        meta: {
          disclaimer:
            "This information is for educational purposes only. Always consult with a qualified healthcare provider.",
          error:
            "Unable to fetch information at this time. Please try again later or consult a healthcare provider.",
          last_updated: new Date().toISOString(),
        },
      },
      { status: 500 },
    );
  }
}
