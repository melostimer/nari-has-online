import "next-auth";
import "next-auth/jwt";

// NextAuth type extension — session ve JWT'ye role ve id ekliyoruz
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "CUSTOMER" | "ADMIN";
    };
  }

  interface User {
    id: string;
    role: "CUSTOMER" | "ADMIN";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "CUSTOMER" | "ADMIN";
  }
}
