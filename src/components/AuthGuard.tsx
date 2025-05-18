"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[]; // les rôles autorisés (ex: ['responsable'])
}

export default function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const { user, loading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
    } else if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.push("/unauthorized");
    }
  }, [user, loading, role, router, allowedRoles]);

  if (loading || !user || (allowedRoles && (!role || !allowedRoles.includes(role)))) {
    return <div className="p-4">Chargement...</div>;
  }

  return <>{children}</>;
}
