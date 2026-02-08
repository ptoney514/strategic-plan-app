/**
 * AuthUser - Unified user type for Better Auth with legacy compatibility shim.
 *
 * The `user_metadata` and `app_metadata` getters provide backward compatibility
 * so existing components that access `user.user_metadata.display_name` or
 * `user.user_metadata.role` continue working without changes.
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isSystemAdmin: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  /** Compatibility shim for legacy user_metadata access */
  user_metadata: {
    display_name: string | null;
    name: string | null;
    role: string | undefined;
  };

  /** Compatibility shim for legacy app_metadata access */
  app_metadata: {
    role: string | undefined;
  };
}

export interface OrgMembership {
  organizationId: string;
  slug: string;
  name: string;
  role: string;
}

/**
 * Maps a Better Auth user object to AuthUser with compatibility shims.
 */
export function mapBetterAuthUser(raw: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  isSystemAdmin?: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}): AuthUser {
  const role = raw.isSystemAdmin ? "system_admin" : undefined;

  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    image: raw.image,
    isSystemAdmin: raw.isSystemAdmin ?? false,
    emailVerified: raw.emailVerified,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    user_metadata: {
      display_name: raw.name,
      name: raw.name,
      role,
    },
    app_metadata: {
      role,
    },
  };
}
