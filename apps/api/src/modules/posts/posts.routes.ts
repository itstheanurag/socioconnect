import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  createPostRoute,
  createPostHandler,
  getPostsRoute,
  getPostsHandler,
  getPostByIdRoute,
  getPostByIdHandler,
  updatePostRoute,
  updatePostHandler,
  cancelPostRoute,
  cancelPostHandler,
} from "./handlers";

export const postRoutes = createRouter<AppBindings>();

postRoutes.openapi(createPostRoute, createPostHandler);
postRoutes.openapi(getPostsRoute, getPostsHandler);
postRoutes.openapi(getPostByIdRoute, getPostByIdHandler);
postRoutes.openapi(updatePostRoute, updatePostHandler);
postRoutes.openapi(cancelPostRoute, cancelPostHandler);
