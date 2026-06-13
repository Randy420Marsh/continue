export const REASONING_EFFORT_TOKENS = {
  minimal: 256,
  low: 512,
  medium: 2048,
  high: 8192,
  max: -1,
} as const;

export type ReasoningEffort = keyof typeof REASONING_EFFORT_TOKENS;

/**
 * Maps our effort enum to OpenRouter's unified reasoning object effort values.
 * OpenRouter supports: xhigh | high | medium | low | minimal | none
 */
export function effortToOpenRouter(
  effort: ReasoningEffort,
): "xhigh" | "high" | "medium" | "low" | "minimal" {
  if (effort === "max") return "xhigh";
  return effort as "high" | "medium" | "low" | "minimal";
}

/**
 * Maps our effort enum to OpenAI Responses API effort values.
 * OpenAI supports: low | medium | high
 */
export function effortToOpenAI(
  effort: ReasoningEffort,
): "low" | "medium" | "high" {
  if (effort === "minimal") return "low";
  if (effort === "max") return "high";
  return effort as "low" | "medium" | "high";
}

/**
 * Maps our effort enum to an Anthropic budget_tokens value.
 * Returns -1 for "max" (unlimited), caller should handle that as model max.
 */
export function effortToBudgetTokens(effort: ReasoningEffort): number {
  return REASONING_EFFORT_TOKENS[effort];
}
