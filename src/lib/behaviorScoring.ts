import type { Ghost, Behavior, GhostBehaviorRule } from "../types";

type Params = {
  ghosts: Ghost[];
  behaviors: Behavior[];
  rules: GhostBehaviorRule[];
  selectedBehaviorIds: number[];
};

function getWeight(
  effect: "rules_out" | "suggests" | "supports",
  confidence: "high" | "medium" | "low"
) {
  if (effect === "rules_out") {
    return -999;
  }

  const base = effect === "suggests" ? 3 : 1;

  if (confidence === "high") return base * 3;
  if (confidence === "medium") return base * 2;
  return base;
}

export function scoreGhostBehaviors({
  ghosts,
  behaviors,
  rules,
  selectedBehaviorIds,
}: Params) {
  return ghosts.map((ghost) => {
    const ghostRules = rules.filter((r) => r.ghost_id === ghost.id);
    let score = 0;
    const matches: string[] = [];
    const ruleOutReasons: string[] = [];

    for (const behaviorId of selectedBehaviorIds) {
      const behavior = behaviors.find((b) => b.id === behaviorId);
      const match = ghostRules.find((r) => r.behavior_id === behaviorId);

      if (!match || !behavior) continue;

      const weight = getWeight(match.effect, match.confidence);

      if (match.effect === "rules_out") {
        ruleOutReasons.push(`${behavior.name} rules this ghost out`);
      } else {
        score += weight;
        matches.push(`${behavior.name} (${match.effect}, ${match.confidence})`);
      }
    }

    return {
      ghost_id: ghost.id,
      score,
      matches,
      ruleOutReasons,
    };
  });
}