"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type Props = {
  allowedRoles?: string[];
  children: React.ReactNode;
};

export default function AuthGuard({ allowedRoles, children }: Props) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const user = auth.currentUser;
      if (!user) {
        router.push("/login");
        return;
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      const userRole = userData?.role;

      // Vérifie si le rôle de l'utilisateur est dans allowedRoles
      if (!allowedRoles || allowedRoles.includes(userRole)) {
        setAuthorized(true);
      } else {
        router.push("/dashboard");
      }
      setLoading(false);
    };
    checkAuth();
  }, [allowedRoles, router]);

  if (loading) return null;
  if (!authorized) return null;

  return <>{children}</>;
}

