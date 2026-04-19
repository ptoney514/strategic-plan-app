import type { Plan } from "../types";

/**
 * Pick the plan the public `/district/[slug]` surface should render.
 * A plan must be both is_active AND is_public to qualify. When multiple
 * qualify, the first in the input array wins — callers should order by
 * order_position before passing in.
 */
export function selectActivePublicPlan(
  plans: Plan[] | undefined | null,
): Plan | null {
  if (!plans?.length) return null;
  return plans.find((p) => p.is_active && p.is_public) ?? null;
}
