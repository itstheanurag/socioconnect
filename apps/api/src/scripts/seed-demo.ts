import path from "node:path";
import dotenv from "dotenv";
import {
  AccountsRepository,
  AuditActorTypeEnum,
  AuditRepository,
  closeDB,
  connectDB,
  DispatchStatusEnum,
  initializeDB,
  PostsRepository,
  PostStatusEnum,
  SocialPlatformEnum,
  SubscriptionsRepository,
  SubscriptionTierEnum,
  BillingIntervalEnum,
  UsageRepository,
  UsageSourceEnum,
  UsersRepository,
  WorkspacesRepository,
} from "@repo/db";
import { encrypt } from "@repo/shared";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const EMAIL = process.env.DEMO_ACCOUNT_EMAIL || "demo@socioconnect.app";
const NAME = process.env.DEMO_ACCOUNT_NAME || "Demo Creator";
const [firstName, ...rest] = NAME.split(" ");
const lastName = rest.join(" ") || "Account";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  if (!process.env.ENCRYPTION_KEY) throw new Error("ENCRYPTION_KEY is required");

  initializeDB({
    connectionString: databaseUrl,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });
  await connectDB();

  let user = await UsersRepository.findByEmail(EMAIL);
  if (!user) {
    user = await UsersRepository.create({
      email: EMAIL,
      firstName,
      lastName,
      avatar: null,
      providerAccountId: `demo-${Date.now()}`,
    });
    console.log(`Created demo user ${EMAIL}`);
  }

  const workspace = await WorkspacesRepository.ensurePersonalWorkspace(
    user.id,
    `${NAME}'s workspace`,
  );

  await SubscriptionsRepository.updateTier(
    user.id,
    SubscriptionTierEnum.CREATOR_PRO,
    BillingIntervalEnum.MONTHLY,
    { customerId: "cus_demo_review", subscriptionId: "sub_demo_review" },
  );

  const token = encrypt("demo-social-token", process.env.ENCRYPTION_KEY);
  const refresh = encrypt("demo-social-refresh", process.env.ENCRYPTION_KEY);

  const xAccount = await AccountsRepository.upsert({
    userId: user.id,
    workspaceId: workspace.id,
    platform: SocialPlatformEnum.X,
    platformAccountId: "demo-x-account",
    username: "socioconnect_demo",
    displayName: "SocioConnect Demo",
    profileUrl: "https://x.com/socioconnect_demo",
    accessToken: token.data,
    accessTokenIv: token.iv,
    accessTokenTag: token.tag,
    accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    refreshToken: refresh.data,
    refreshTokenIv: refresh.iv,
    refreshTokenTag: refresh.tag,
    refreshTokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    scopes: ["tweet.read", "tweet.write", "users.read"],
    metadata: { demo: true },
  });

  const linkedIn = await AccountsRepository.upsert({
    userId: user.id,
    workspaceId: workspace.id,
    platform: SocialPlatformEnum.LINKEDIN,
    platformAccountId: "demo-linkedin-account",
    username: "socioconnect-demo",
    displayName: "SocioConnect Demo",
    profileUrl: "https://linkedin.com/company/socioconnect-demo",
    accessToken: token.data,
    accessTokenIv: token.iv,
    accessTokenTag: token.tag,
    accessTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    refreshToken: refresh.data,
    refreshTokenIv: refresh.iv,
    refreshTokenTag: refresh.tag,
    refreshTokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    scopes: ["w_member_social", "r_liteprofile"],
    metadata: { demo: true },
  });

  const existingPosts = await PostsRepository.findAllByUserId(user.id, { limit: 1 });

  if (existingPosts.length === 0) {
    const scheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PostsRepository.createWithDispatches({
      post: {
        userId: user.id,
        workspaceId: workspace.id,
        title: "SocioConnect weekly update",
        content:
          "One draft. Multiple platforms. Explicit approval before anything goes live. That is the SocioConnect workflow.",
        tags: ["product", "publishing"],
        status: PostStatusEnum.SCHEDULED,
        scheduledAt,
      },
      dispatches: [
        {
          accountId: xAccount.id,
          platform: SocialPlatformEnum.X,
          status: DispatchStatusEnum.PENDING,
          scheduledFor: scheduledAt,
        },
        {
          accountId: linkedIn.id,
          platform: SocialPlatformEnum.LINKEDIN,
          status: DispatchStatusEnum.PENDING,
          scheduledFor: scheduledAt,
          customContent:
            "One draft. Multiple platforms. Explicit approval before anything goes live.\n\nThat is the SocioConnect workflow.",
        },
      ],
    });

    await PostsRepository.createWithDispatches({
      post: {
        userId: user.id,
        workspaceId: workspace.id,
        title: "Ship notes",
        content: "Draft for the next product update. Review before publishing.",
        tags: ["draft"],
        status: PostStatusEnum.DRAFT,
      },
      dispatches: [
        {
          accountId: xAccount.id,
          platform: SocialPlatformEnum.X,
          status: DispatchStatusEnum.DRAFT,
          scheduledFor: new Date(),
        },
      ],
    });

    await PostsRepository.createWithDispatches({
      post: {
        userId: user.id,
        workspaceId: workspace.id,
        title: "Launch day",
        content: "SocioConnect is live. Compose once, publish everywhere.",
        tags: ["launch"],
        status: PostStatusEnum.PUBLISHED,
        scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      dispatches: [
        {
          accountId: xAccount.id,
          platform: SocialPlatformEnum.X,
          status: DispatchStatusEnum.SUCCESS,
          scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          externalPostId: "demo_x_post_1",
          externalPostUrl: "https://x.com/socioconnect_demo/status/demo_x_post_1",
          dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
          accountId: linkedIn.id,
          platform: SocialPlatformEnum.LINKEDIN,
          status: DispatchStatusEnum.SUCCESS,
          scheduledFor: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          externalPostId: "demo_li_post_1",
          externalPostUrl: "https://linkedin.com/feed/update/demo_li_post_1",
          dispatchedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    await AuditRepository.record({
      workspaceId: workspace.id,
      actorType: AuditActorTypeEnum.SYSTEM,
      actorId: null,
      action: "demo.seeded",
      resourceType: "workspace",
      resourceId: workspace.id,
      metadata: { accounts: 2, posts: 3 },
    });

    await UsageRepository.record({
      workspaceId: workspace.id,
      source: UsageSourceEnum.SYSTEM,
      operation: "publish_operation",
      quantity: 2,
      metadata: { demo: true },
    });

    console.log("Seeded demo accounts and posts");
  } else {
    console.log("Demo posts already exist; skipped seeding posts");
  }

  console.log("");
  console.log("Demo account ready");
  console.log(`  email:    ${EMAIL}`);
  console.log(`  password: ${process.env.DEMO_ACCOUNT_PASSWORD ? "(set via DEMO_ACCOUNT_PASSWORD)" : "(not set)"}`);
  console.log(`  login:    ${process.env.FRONTEND_URL || "http://localhost:3000"}/demo`);
  console.log(`  workspace:${workspace.id}`);
  console.log("");

  await closeDB();
}

main().catch(async (err) => {
  console.error("Demo seed failed:", err);
  try {
    await closeDB();
  } catch {
    // ignore
  }
  process.exit(1);
});
