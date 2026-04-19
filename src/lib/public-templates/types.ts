import type { ComponentType } from "react";
import type { PublicTemplateId } from "../types";

export type { PublicTemplateId };

export interface PublicTemplateDefinition {
  id: PublicTemplateId;
  label: string;
  description: string;
  LandingView: ComponentType;
  supportsObjectiveDetailPage: boolean;
}
