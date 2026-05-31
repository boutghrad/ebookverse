import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Handle GitHub OAuth sign-in
      if (account?.provider === 'github' && profile) {
        try {
          // Check if user already exists by email
          const existingUser = await db.user.findUnique({
            where: { email: profile.email as string },
          });

          if (existingUser) {
            // User exists - check if GitHub account is linked
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: 'github',
              },
            });

            if (!existingAccount) {
              // Link GitHub account to existing user
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  refresh_token: account.refresh_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }

            // Update user info from GitHub
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: existingUser.name || profile.name || profile.login,
                image: existingUser.image || profile.avatar_url as string,
              },
            });

            return true;
          }

          // New user - create user + account
          const newUser = await db.user.create({
            data: {
              email: profile.email as string,
              name: profile.name || profile.login || 'GitHub User',
              image: profile.avatar_url as string,
              role: 'USER',
              emailVerified: new Date(),
            },
          });

          await db.account.create({
            data: {
              userId: newUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              session_state: account.session_state,
            },
          });

          // Create welcome notification
          await db.notification.create({
            data: {
              userId: newUser.id,
              title: 'Welcome to EbookVerse!',
              message: 'Your account has been created successfully via GitHub. Enjoy your reading journey!',
              type: 'success',
            },
          });

          return true;
        } catch (error) {
          console.error('GitHub sign-in error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;

        // For GitHub OAuth, find the user in DB to get the role
        if (account?.provider === 'github') {
          const dbUser = await db.user.findUnique({
            where: { email: user.email as string },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.id = dbUser.id;
          }
        }
      } else if (token.id) {
        // Always refresh role from database so role changes take effect immediately
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET || "ebookverse-secret-key-2024",
};
