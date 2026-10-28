import { createRouter, authRateLimiter } from "@repo/shared";
import {
  getOauthProviderRoute,
  getOauthHandler,
  getOauthCallbackRoute,
  getOauthCallbackHandler,
  postOauthAppleCallbackRoute,
  postOauthAppleCallbackHandler,
  postRefreshTokenRoute,
  postRefreshTokenHandler,
  getOauthSessionEstablishRoute,
  getOauthSessionEstablishHandler,
  getMeHandler,
  getMeRoute,
  getLogoutHandler,
  getLogoutRoute,
  postDemoLoginRoute,
  postDemoLoginHandler,
} from "./handlers";
import { type AppBindings } from "../../types";

const authRoutes = createRouter<AppBindings>();

// Apply auth-specific rate limiting
authRoutes.use(authRateLimiter);

// Register routes - each handler defines its own OpenAPI schema
authRoutes.openapi(getOauthProviderRoute, getOauthHandler);
authRoutes.openapi(getOauthCallbackRoute, getOauthCallbackHandler);
authRoutes.openapi(postOauthAppleCallbackRoute, postOauthAppleCallbackHandler);
authRoutes.openapi(getOauthSessionEstablishRoute, getOauthSessionEstablishHandler);
authRoutes.openapi(postRefreshTokenRoute, postRefreshTokenHandler);
authRoutes.openapi(getMeRoute, getMeHandler);
authRoutes.openapi(getLogoutRoute, getLogoutHandler);
authRoutes.openapi(postDemoLoginRoute, postDemoLoginHandler);

export default authRoutes;
