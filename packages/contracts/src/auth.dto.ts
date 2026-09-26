import { z } from "zod";

export const AuthProviderSchema = z.enum(["google", "github", "apple", "twitter", "facebook"]);
export type AuthProvider = z.infer<typeof AuthProviderSchema>;

export const AuthUserDtoSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  role: z.string(),
  createdAt: z.string().optional(),
});
export type AuthUserDto = z.infer<typeof AuthUserDtoSchema>;

export const OAuthUrlQuerySchema = z.object({
  redirect: z.enum(["true", "false"]).optional().default("true"),
});

export type OAuthUrlQuery = z.infer<typeof OAuthUrlQuerySchema>;

export const OAuthUrlResponseSchema = z.object({
  link: z.string().url(),
});

export type OAuthUrlResponse = z.infer<typeof OAuthUrlResponseSchema>;

export const TokenPayloadSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
});

export type TokenPayload = z.infer<typeof TokenPayloadSchema>;
