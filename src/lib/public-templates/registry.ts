import { lazy } from "react";
import type { PublicTemplateDefinition, PublicTemplateId } from "./types";

export const DEFAULT_PUBLIC_TEMPLATE_ID: PublicTemplateId = "sidebar-tree";

// Templates register their LandingView here. Each is lazy-loaded so only the
// template the district actually uses ships to the client. Stage 3 wires
// sidebar-tree to its real component; Stages 5–7 wire editorial-onepager.
// Until then, placeholder modules exist so the registry contract holds.
const SidebarTreeLandingView = lazy(
  () => import("../../views/v2/public/templates/sidebar-tree/SidebarLandingView"),
);

const EditorialOnepagerLandingView = lazy(
  () =>
    import(
      "../../views/v2/public/templates/editorial-onepager/EditorialLandingView"
    ),
);

export const PUBLIC_TEMPLATES: Record<
  PublicTemplateId,
  PublicTemplateDefinition
> = {
  "sidebar-tree": {
    id: "sidebar-tree",
    label: "Sidebar tree",
    description:
      "Left-sidebar navigation with a per-objective drill-down page. Good default for districts without hand-written narrative content.",
    LandingView: SidebarTreeLandingView,
    supportsObjectiveDetailPage: true,
  },
  "editorial-onepager": {
    id: "editorial-onepager",
    label: "Editorial one-pager",
    description:
      "Long-scroll editorial layout: hero, four commitments overview, per-objective sections, pull quote, CTA. For districts with narrative content ready.",
    LandingView: EditorialOnepagerLandingView,
    supportsObjectiveDetailPage: false,
  },
};

export function getPublicTemplate(
  id: PublicTemplateId,
): PublicTemplateDefinition {
  return PUBLIC_TEMPLATES[id] ?? PUBLIC_TEMPLATES[DEFAULT_PUBLIC_TEMPLATE_ID];
}
