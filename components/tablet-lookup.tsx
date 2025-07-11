"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Pill,
  AlertTriangle,
  Info,
  Clock,
  Heart,
  Shield,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TabletInfo {
  name: string;
  genericName: string;
  brandNames: string[];
  strength: string;
  dosageForm: string;
  uses: string[];
  sideEffects: {
    common: string[];
    serious: string[];
    rare: string[];
  };
  warnings: string[];
  interactions: string[];
  dosage: {
    adult: string;
    pediatric?: string;
    elderly?: string;
  };
  contraindications: string[];
  pregnancy: string;
  breastfeeding: string;
}

export default function TabletLookup() {
  const [searchTerm, setSearchTerm] = useState("");
  const [tabletInfo, setTabletInfo] = useState<TabletInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const searchTablet = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a tablet name",
        description: "Enter the name or generic name of the medication",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Using OpenFDA API for drug information
      const response = await fetch(
        `/api/tablet-lookup?q=${encodeURIComponent(searchTerm)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tablet information");
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const drugInfo = data.results[0];

        const formattedInfo: TabletInfo = {
          name: drugInfo.brand_name || searchTerm,
          genericName:
            drugInfo.generic_name || drugInfo.substance_name || "Not available",
          brandNames: drugInfo.brand_name ? [drugInfo.brand_name] : [],
          strength:
            drugInfo.active_ingredient?.[0]?.strength || "Not specified",
          dosageForm: drugInfo.dosage_form || "Not specified",
          uses: drugInfo.indications_and_usage
            ? [drugInfo.indications_and_usage]
            : ["Information not available"],
          sideEffects: {
            common: drugInfo.adverse_reactions
              ? drugInfo.adverse_reactions.split(".").slice(0, 5)
              : [],
            serious: drugInfo.warnings
              ? drugInfo.warnings.split(".").slice(0, 3)
              : [],
            rare: [],
          },
          warnings: drugInfo.warnings_and_cautions
            ? drugInfo.warnings_and_cautions.split(".").slice(0, 5)
            : [],
          interactions: drugInfo.drug_interactions
            ? drugInfo.drug_interactions.split(".").slice(0, 5)
            : [],
          dosage: {
            adult:
              drugInfo.dosage_and_administration ||
              "Consult healthcare provider",
          },
          contraindications: drugInfo.contraindications
            ? drugInfo.contraindications.split(".").slice(0, 3)
            : [],
          pregnancy: drugInfo.pregnancy || "Consult healthcare provider",
          breastfeeding:
            drugInfo.nursing_mothers || "Consult healthcare provider",
        };

        setTabletInfo(formattedInfo);
        setSearchHistory((prev) =>
          [searchTerm, ...prev.filter((item) => item !== searchTerm)].slice(
            0,
            5,
          ),
        );

        toast({
          title: "Tablet information found",
          description: `Information for ${formattedInfo.name} has been loaded`,
        });
      } else {
        // Fallback with basic information structure
        const basicInfo: TabletInfo = {
          name: searchTerm,
          genericName: "Information not available",
          brandNames: [],
          strength: "Consult package insert",
          dosageForm: "Various forms available",
          uses: [
            "Please consult with a healthcare professional for specific uses",
          ],
          sideEffects: {
            common: ["Consult package insert or healthcare provider"],
            serious: ["Seek immediate medical attention for serious reactions"],
            rare: [],
          },
          warnings: ["Always follow healthcare provider instructions"],
          interactions: ["Consult healthcare provider about drug interactions"],
          dosage: {
            adult: "Follow healthcare provider instructions",
          },
          contraindications: ["Consult healthcare provider"],
          pregnancy: "Consult healthcare provider before use during pregnancy",
          breastfeeding:
            "Consult healthcare provider before use while breastfeeding",
        };

        setTabletInfo(basicInfo);

        toast({
          title: "Limited information available",
          description:
            "Please consult a healthcare professional for complete information",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching tablet info:", error);
      toast({
        title: "Error fetching information",
        description: "Please try again or consult a healthcare professional",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchTablet();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="mr-2 h-5 w-5" />
            Tablet Information Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter tablet or medication name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={searchTablet} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Search History */}
          {searchHistory.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                Recent searches:
              </p>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((term, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => setSearchTerm(term)}
                  >
                    {term}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tablet Information */}
      {tabletInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{tabletInfo.name}</span>
              <Badge variant="secondary">
                <Info className="h-4 w-4 mr-1" />
                Medication Info
              </Badge>
            </CardTitle>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <strong>Generic Name:</strong> {tabletInfo.genericName}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Strength:</strong> {tabletInfo.strength}
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Form:</strong> {tabletInfo.dosageForm}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="uses" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="uses">Uses</TabsTrigger>
                <TabsTrigger value="side-effects">Side Effects</TabsTrigger>
                <TabsTrigger value="warnings">Warnings</TabsTrigger>
                <TabsTrigger value="dosage">Dosage</TabsTrigger>
              </TabsList>

              {/* Uses Tab */}
              <TabsContent value="uses" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Heart className="h-4 w-4 mr-2 text-blue-500" />
                      Medical Uses
                    </h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-2">
                        {tabletInfo.uses.map((use, index) => (
                          <li key={index} className="text-sm">
                            • {use}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  {tabletInfo.brandNames.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Brand Names</h4>
                      <div className="flex flex-wrap gap-2">
                        {tabletInfo.brandNames.map((brand, index) => (
                          <Badge key={index} variant="outline">
                            {brand}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Side Effects Tab */}
              <TabsContent value="side-effects" className="space-y-4">
                <div className="space-y-4">
                  {tabletInfo.sideEffects.common.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center mb-2">
                        <Info className="h-4 w-4 mr-2 text-blue-500" />
                        Common Side Effects
                      </h4>
                      <ScrollArea className="h-24">
                        <ul className="space-y-1">
                          {tabletInfo.sideEffects.common.map(
                            (effect, index) => (
                              <li key={index} className="text-sm">
                                • {effect}
                              </li>
                            ),
                          )}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}

                  {tabletInfo.sideEffects.serious.length > 0 && (
                    <div>
                      <h4 className="font-semibold flex items-center mb-2">
                        <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                        Serious Side Effects
                      </h4>
                      <ScrollArea className="h-24">
                        <ul className="space-y-1">
                          {tabletInfo.sideEffects.serious.map(
                            (effect, index) => (
                              <li key={index} className="text-sm text-red-600">
                                • {effect}
                              </li>
                            ),
                          )}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}

                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      If you experience any serious side effects, contact your
                      healthcare provider immediately.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Warnings Tab */}
              <TabsContent value="warnings" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Shield className="h-4 w-4 mr-2 text-orange-500" />
                      Important Warnings
                    </h4>
                    <ScrollArea className="h-32">
                      <ul className="space-y-2">
                        {tabletInfo.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </ScrollArea>
                  </div>

                  {tabletInfo.contraindications.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">
                          Contraindications
                        </h4>
                        <ul className="space-y-1">
                          {tabletInfo.contraindications.map((contra, index) => (
                            <li key={index} className="text-sm text-red-600">
                              • {contra}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="p-3 bg-pink-50 dark:bg-pink-950 rounded-lg">
                      <p className="text-sm">
                        <strong>Pregnancy:</strong> {tabletInfo.pregnancy}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <p className="text-sm">
                        <strong>Breastfeeding:</strong>{" "}
                        {tabletInfo.breastfeeding}
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Dosage Tab */}
              <TabsContent value="dosage" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-green-500" />
                      Dosage Information
                    </h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <p className="text-sm">
                          <strong>Adult Dosage:</strong>{" "}
                          {tabletInfo.dosage.adult}
                        </p>
                      </div>

                      {tabletInfo.dosage.pediatric && (
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                          <p className="text-sm">
                            <strong>Pediatric Dosage:</strong>{" "}
                            {tabletInfo.dosage.pediatric}
                          </p>
                        </div>
                      )}

                      {tabletInfo.dosage.elderly && (
                        <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                          <p className="text-sm">
                            <strong>Elderly Dosage:</strong>{" "}
                            {tabletInfo.dosage.elderly}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {tabletInfo.interactions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">
                          Drug Interactions
                        </h4>
                        <ScrollArea className="h-24">
                          <ul className="space-y-1">
                            {tabletInfo.interactions.map(
                              (interaction, index) => (
                                <li key={index} className="text-sm">
                                  • {interaction}
                                </li>
                              ),
                            )}
                          </ul>
                        </ScrollArea>
                      </div>
                    </>
                  )}

                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <AlertTriangle className="h-4 w-4 inline mr-1" />
                      Always follow your healthcare provider's instructions for
                      dosage and duration.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-semibold mb-1">Medical Disclaimer</p>
              <p>
                This information is for educational purposes only and should not
                replace professional medical advice. Always consult with a
                qualified healthcare provider before starting, stopping, or
                changing any medication.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
