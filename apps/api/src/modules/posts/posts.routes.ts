import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import { createPostRoute, createPostHandler } from "./handlers/create-post.handler";
import {
  getPostsRoute,
  getPostsHandler,
  getPostByIdRoute,
  getPostByIdHandler,
} from "./handlers/get-posts.handler";

export const postRoutes = createRouter<AppBindings>();

postRoutes.openapi(createPostRoute, createPostHandler);
postRoutes.openapi(getPostsRoute, getPostsHandler);
postRoutes.openapi(getPostByIdRoute, getPostByIdHandler);
