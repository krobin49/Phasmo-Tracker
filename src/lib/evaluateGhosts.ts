import type { Ghost, GhostEvidenceRule, Evidence } from "../types";

type Params = {
  ghosts: Ghost[];
  rules: GhostEvidenceRule[];
  evidence: Evidence[];
  evidenceStates: Record<number, "unknown" | "confirmed" | "ruled_out">;
  evidenceGiven: number;
};

export function evaluateGhosts({
  ghosts,
  rules,
  evidence,
  evidenceStates,
  evidenceGiven,
}: Params) {
  return ghosts.map((ghost) => {
    const ghostRules = rules.filter((r) => r.ghost_id === ghost.id);
    const allEvidenceIds = ghostRules.map((r) => r.evidence_id);
    const primaryRules = ghostRules.filter((r) => r.is_primary);

    const reasons: string[] = [];

    for (const [evidenceIdString, state] of Object.entries(evidenceStates)) {
      const evidenceId = Number(evidenceIdString);
      const evidenceName =
        evidence.find((e) => e.id === evidenceId)?.name ?? `Evidence ${evidenceId}`;

      if (state === "confirmed" && !allEvidenceIds.includes(evidenceId)) {
        reasons.push(`Does not have confirmed evidence: ${evidenceName}`);
      }
    }

    if (evidenceGiven === 3) {
      for (const [evidenceIdString, state] of Object.entries(evidenceStates)) {
        const evidenceId = Number(evidenceIdString);
        const evidenceName =
          evidence.find((e) => e.id === evidenceId)?.name ?? `Evidence ${evidenceId}`;

        if (
          state === "ruled_out" &&
          primaryRules.some((r) => r.evidence_id === evidenceId)
        ) {
          reasons.push(`Requires ruled-out evidence: ${evidenceName}`);
        }
      }
    }

    for (const rule of ghostRules) {
      const evidenceName =
        evidence.find((e) => e.id === rule.evidence_id)?.name ??
        `Evidence ${rule.evidence_id}`;

      if (
        rule.forced &&
        rule.forced_visible_min_evidence_count !== undefined &&
        rule.forced_visible_min_evidence_count >= evidenceGiven &&
        evidenceStates[rule.evidence_id] === "ruled_out"
      ) {
        reasons.push(`Missing forced evidence: ${evidenceName}`);
      }
    }

    return {
      ghost,
      possible: reasons.length === 0,
      reasons,
    };
  });
}