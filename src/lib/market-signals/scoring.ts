import type { BuyerPersona, MarketSignal, PromotionStatus } from "@/lib/market-signals/types";

export function inferBusinessType(name: string, description: string) {
  const value = `${name} ${description}`.toLowerCase();

  if (
    value.includes("restaurant") ||
    value.includes("cafe") ||
    value.includes("bbq") ||
    value.includes("bar") ||
    value.includes("kitchen")
  ) {
    return "restaurant" as const;
  }

  if (value.includes("llc")) {
    return "llc" as const;
  }

  if (value.includes("inc") || value.includes("corp")) {
    return "corporation" as const;
  }

  return "corporation" as const;
}

export function inferFoodServiceBusinessType(name: string, permitType: string) {
  const value = `${name} ${permitType}`.toLowerCase();

  if (
    value.includes("restaurant") ||
    value.includes("deli") ||
    value.includes("cafe") ||
    value.includes("coffee") ||
    value.includes("bar") ||
    value.includes("kitchen") ||
    value.includes("mobile unit") ||
    value.includes("pushcart")
  ) {
    return "restaurant" as const;
  }

  if (value.includes("llc")) {
    return "llc" as const;
  }

  return "corporation" as const;
}

export function inferBuyerPersonas(
  entityName: string,
  businessType: MarketSignal["entity_type"],
) {
  const value = entityName.toLowerCase();
  const personas = new Set<BuyerPersona>();

  personas.add("merchant_services");
  personas.add("payroll");

  if (businessType === "restaurant") {
    personas.add("pos");
    personas.add("food_distribution");
    personas.add("uniforms");
  }

  if (
    value.includes("restaurant") ||
    value.includes("grill") ||
    value.includes("cafe") ||
    value.includes("coffee") ||
    value.includes("kitchen")
  ) {
    personas.add("pos");
    personas.add("food_distribution");
  }

  if (
    value.includes("medical") ||
    value.includes("dental") ||
    value.includes("health")
  ) {
    personas.add("janitorial");
    personas.add("uniforms");
  }

  return [...personas];
}

export function scoreBusinessLicenseSignal(input: {
  entityName: string;
  businessType: MarketSignal["entity_type"];
  hasAddress: boolean;
  hasRecentDate: boolean;
}) {
  let confidence = 0.54;
  let leadScore = 46;

  if (input.businessType === "restaurant") {
    confidence += 0.18;
    leadScore += 20;
  }

  if (input.hasAddress) {
    confidence += 0.12;
    leadScore += 10;
  }

  if (input.hasRecentDate) {
    confidence += 0.08;
    leadScore += 8;
  }

  if (input.entityName.toLowerCase().includes("llc")) {
    confidence += 0.04;
    leadScore += 4;
  }

  const boundedConfidence = Math.min(0.96, Number(confidence.toFixed(2)));
  const boundedLeadScore = Math.min(100, leadScore);

  return {
    confidenceScore: boundedConfidence,
    leadScore: boundedLeadScore,
    promotionStatus: promotionStatusForScore(boundedLeadScore),
  };
}

export function scoreFoodPermitSignal(input: {
  entityName: string;
  permitType: string;
  operationalStatus: string;
  hasAddress: boolean;
}) {
  let confidence = 0.58;
  let leadScore = 52;
  const permitValue = input.permitType.toLowerCase();
  const statusValue = input.operationalStatus.toLowerCase();

  if (
    permitValue.includes("restaurant") ||
    permitValue.includes("deli") ||
    permitValue.includes("mobile unit") ||
    permitValue.includes("pushcart")
  ) {
    confidence += 0.12;
    leadScore += 16;
  }

  if (statusValue.includes("operational") || statusValue.includes("open")) {
    confidence += 0.1;
    leadScore += 12;
  }

  if (input.hasAddress) {
    confidence += 0.08;
    leadScore += 8;
  }

  if (
    input.entityName.toLowerCase().includes("grill") ||
    input.entityName.toLowerCase().includes("cafe") ||
    input.entityName.toLowerCase().includes("coffee")
  ) {
    confidence += 0.04;
    leadScore += 6;
  }

  const boundedConfidence = Math.min(0.96, Number(confidence.toFixed(2)));
  const boundedLeadScore = Math.min(100, leadScore);

  return {
    confidenceScore: boundedConfidence,
    leadScore: boundedLeadScore,
    promotionStatus: promotionStatusForScore(boundedLeadScore),
  };
}

export function promotionStatusForScore(score: number): PromotionStatus {
  if (score >= 78) {
    return "lead_queue";
  }

  if (score >= 60) {
    return "watch";
  }

  return "feed_only";
}
