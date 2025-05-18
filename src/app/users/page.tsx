"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import AuthGuard from "@/components/AuthGuard";

type UserData = {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResponsable, setIsResponsable] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkRoleAndFetchUsers = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.push("/login");
        return;
      }

      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      const data = userDoc.data();
      if (data?.role !== "responsable") {
        router.push("/dashboard");
        return;
      }

      setIsResponsable(true);
      const querySnapshot = await getDocs(collection(db, "users"));
      const userList: UserData[] = [];
      querySnapshot.forEach((doc) => {
        const user = doc.data();
        userList.push({
          id: doc.id,
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
        });
      });
      setUsers(userList);
      setLoading(false);
    };

    checkRoleAndFetchUsers();
  }, [router]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { role: newRole });

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  if (loading) return <p>Chargement...</p>;
  if (!isResponsable) return null;

  return (
    <AuthGuard>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Gestion des rôles</h1>
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nom</th>
              <th className="p-2">Prénom</th>
              <th className="p-2">Email</th>
              <th className="p-2">Rôle</th>
              <th className="p-2">Changer le rôle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="p-2">{user.nom}</td>
                <td className="p-2">{user.prenom}</td>
                <td className="p-2">{user.email}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="employe">Employé</option>
                    <option value="responsable">Responsable</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}
