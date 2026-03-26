import type { Ghost, HuntType, GhostHuntRule } from "../types";

type Params = {
  ghosts: Ghost[];
  huntTypes: HuntType[];
  rules: GhostHuntRule[];
  selectedHuntId: number | null;
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

export function scoreGhostHunt({
  ghosts,
  huntTypes,
  rules,
  selectedHuntId,
}: Params) {
  return ghosts.map((ghost) => {
    const ghostRules = rules.filter((r) => r.ghost_id === ghost.id);
    let score = 0;
    const matches: string[] = [];
    const ruleOutReasons: string[] = [];

    if (selectedHuntId === null) {
      return {
        ghost_id: ghost.id,
        score,
        matches,
        ruleOutReasons,
      };
    }

    const hunt = huntTypes.find((h) => h.id === selectedHuntId);
    const match = ghostRules.find((r) => r.hunt_id === selectedHuntId);

    if (!match || !hunt) {
      return {
        ghost_id: ghost.id,
        score,
        matches,
        ruleOutReasons,
      };
    }

    const weight = getWeight(match.effect, match.confidence);

    if (match.effect === "rules_out") {
      ruleOutReasons.push(`${hunt.name} hunt threshold rules this ghost out`);
    } else {
      score += weight;
      matches.push(`${hunt.name} (${match.effect}, ${match.confidence})`);
    }

    return {
      ghost_id: ghost.id,
      score,
      matches,
      ruleOutReasons,
    };
  });
}