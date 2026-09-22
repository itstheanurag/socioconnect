import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getCommunityGroupsRoute,
  getCommunityGroupsHandler,
  createCommunityGroupRoute,
  createCommunityGroupHandler,
  deleteCommunityGroupRoute,
  deleteCommunityGroupHandler,
} from "./handlers/community-groups.handler";
import {
  getAutomationsRoute,
  getAutomationsHandler,
  createAutomationRoute,
  createAutomationHandler,
  triggerAutomationNowRoute,
  triggerAutomationNowHandler,
} from "./handlers/community-automations.handler";

export const communityRoutes = createRouter<AppBindings>();

// Community Groups
communityRoutes.openapi(getCommunityGroupsRoute, getCommunityGroupsHandler);
communityRoutes.openapi(createCommunityGroupRoute, createCommunityGroupHandler);
communityRoutes.openapi(deleteCommunityGroupRoute, deleteCommunityGroupHandler);

// Community Automations
communityRoutes.openapi(getAutomationsRoute, getAutomationsHandler);
communityRoutes.openapi(createAutomationRoute, createAutomationHandler);
communityRoutes.openapi(triggerAutomationNowRoute, triggerAutomationNowHandler);
