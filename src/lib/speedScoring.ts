import type { Ghost, SpeedType, GhostSpeedRule } from "../types";

type Params = {
  ghosts: Ghost[];
  speedTypes: SpeedType[];
  rules: GhostSpeedRule[];
  selectedSpeedId: number | null;
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

export function scoreGhostSpeed({
  ghosts,
  speedTypes,
  rules,
  selectedSpeedId,
}: Params) {
  return ghosts.map((ghost) => {
    const ghostRules = rules.filter((r) => r.ghost_id === ghost.id);
    let score = 0;
    const matches: string[] = [];
    const ruleOutReasons: string[] = [];

    if (selectedSpeedId === null) {
      return {
        ghost_id: ghost.id,
        score,
        matches,
        ruleOutReasons,
      };
    }

    const speed = speedTypes.find((s) => s.id === selectedSpeedId);
    const match = ghostRules.find((r) => r.speed_id === selectedSpeedId);

    if (!match || !speed) {
      return {
        ghost_id: ghost.id,
        score,
        matches,
        ruleOutReasons,
      };
    }

    const weight = getWeight(match.effect, match.confidence);

    if (match.effect === "rules_out") {
      ruleOutReasons.push(`${speed.name} rules this ghost out`);
    } else {
      score += weight;
      matches.push(`${speed.name} (${match.effect}, ${match.confidence})`);
    }

    return {
      ghost_id: ghost.id,
      score,
      matches,
      ruleOutReasons,
    };
  });
}