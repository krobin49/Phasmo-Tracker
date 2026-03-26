import type { HuntType } from "../types";

export const huntTypes: HuntType[] = [
  {
    id: 1,
    name: "Early",
    description: "Hunted before 50%",
  },
  {
    id: 2,
    name: "Normal",
    description: "Hunted after 50%",
  },
  {
    id: 3,
    name: "Late",
    description: "Hunted at 40% or lower",
  },
];