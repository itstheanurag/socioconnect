import { createRouter } from "@repo/shared";
import type { AppBindings } from "@/types";
import {
  getPresignedUrlRoute,
  getPresignedUrlHandler,
  confirmMediaUploadRoute,
  confirmMediaUploadHandler,
  getMediaRoute,
  getMediaHandler,
  deleteMediaRoute,
  deleteMediaHandler,
} from "./handlers";

export const mediaRoutes = createRouter<AppBindings>();

mediaRoutes.openapi(getPresignedUrlRoute, getPresignedUrlHandler);
mediaRoutes.openapi(confirmMediaUploadRoute, confirmMediaUploadHandler);
mediaRoutes.openapi(getMediaRoute, getMediaHandler);
mediaRoutes.openapi(deleteMediaRoute, deleteMediaHandler);
