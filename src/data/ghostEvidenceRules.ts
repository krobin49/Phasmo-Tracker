import type { GhostEvidenceRule } from "../types";

export const ghostEvidenceRules: GhostEvidenceRule[] = [
  { ghost_id: 1, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 1, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 1, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 2, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 2, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 2, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 3, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 3, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 3, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 4, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 4, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 4, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 5, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 5, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 5, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 6, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 6, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 6, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 7, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 7, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 7, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 8, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 8, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 8, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 9, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 9, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 9, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 10, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 10, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 10, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 11, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 11, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 11, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 12, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 12, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 12, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 13, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 13, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 13, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 14, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 14, evidence_id: 4, rule_type: "normal", forced: true, is_primary: true, forced_visible_min_evidence_count: 1 },
  { ghost_id: 14, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 15, evidence_id: 5, rule_type: "normal", forced: true, is_primary: true, forced_visible_min_evidence_count: 1 },
  { ghost_id: 15, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 15, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 16, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 16, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 16, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 17, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 17, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 17, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 18, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 18, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 18, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 19, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 19, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 19, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 20, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 20, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 20, evidence_id: 6, rule_type: "normal", forced: true, is_primary: true, forced_visible_min_evidence_count: 1 },

  { ghost_id: 21, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 21, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 21, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 21, evidence_id: 7, rule_type: "extra", forced: true, is_primary: false, forced_visible_min_evidence_count: 0 },

  { ghost_id: 22, evidence_id: 2, rule_type: "normal", forced: true, is_primary: true, forced_visible_min_evidence_count: 1 },
  { ghost_id: 22, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 22, evidence_id: 4, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 23, evidence_id: 2, rule_type: "normal", forced: true, is_primary: true, forced_visible_min_evidence_count: 1 },
  { ghost_id: 23, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 23, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 24, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 24, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 24, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 25, evidence_id: 3, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 25, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 25, evidence_id: 5, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 26, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 26, evidence_id: 6, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 26, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },

  { ghost_id: 27, evidence_id: 1, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 27, evidence_id: 7, rule_type: "normal", forced: false, is_primary: true },
  { ghost_id: 27, evidence_id: 2, rule_type: "normal", forced: false, is_primary: true },
];