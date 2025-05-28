"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { collection, getDocs, updateDoc, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import AuthGuard from "@/components/AuthGuard";
import Link from "next/link";
import { Home } from "lucide-react";

type UserData = {
  id: string;
  nom: string;
  prenom: string;
  identifiant: string;
  role: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isResponsable, setIsResponsable] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: "",
    prenom: "",
    identifiant: "",
    password: "",
    role: "",
  });
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
      querySnapshot.forEach((docu) => {
        const user = docu.data();
        userList.push({
          id: docu.id,
          nom: user.nom,
          prenom: user.prenom,
          identifiant: user.identifiant,
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

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newUser.identifiant) {
        alert("Veuillez saisir un identifiant.");
        return;
      }
      // Génère un email fictif à partir de l'identifiant
      const email = `${newUser.identifiant.toLowerCase().trim()}@mondomaine.com`;
      // Crée l'utilisateur dans Firebase Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email,
        newUser.password
      );
      // Ajoute l'utilisateur dans Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        nom: newUser.nom,
        prenom: newUser.prenom,
        identifiant: newUser.identifiant,
        role: newUser.role,
        uid: cred.user.uid,
      });
      setUsers((prev) => [
        ...prev,
        {
          id: cred.user.uid,
          nom: newUser.nom,
          prenom: newUser.prenom,
          identifiant: newUser.identifiant,
          role: newUser.role,
        },
      ]);
      setNewUser({
        nom: "",
        prenom: "",
        identifiant: "",
        password: "",
        role: "",
      });
      alert("Utilisateur ajouté !");
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await deleteDoc(doc(db, "users", userId));
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  if (loading) return <p>Chargement...</p>;
  if (!isResponsable) return null;

  return (
    <AuthGuard>
      <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <Home className="h-4 w-4" />
          Tableau de bord
        </Link>
        <h1 className="text-2xl font-bold mb-4">Gestion des rôles</h1>
        <form
          onSubmit={handleAddUser}
          className="flex flex-wrap gap-2 items-end mb-6 border p-4 rounded"
        >
          <input
            type="text"
            placeholder="Nom"
            className="border p-2 rounded"
            value={newUser.nom}
            onChange={(e) => setNewUser({ ...newUser, nom: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Prénom"
            className="border p-2 rounded"
            value={newUser.prenom}
            onChange={(e) => setNewUser({ ...newUser, prenom: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Identifiant"
            className="border p-2 rounded"
            value={newUser.identifiant}
            onChange={(e) => setNewUser({ ...newUser, identifiant: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            className="border p-2 rounded"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            required
          />
          <select
            className="border p-2 rounded"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
            required
          >
            <option value="">Choisir un rôle</option>
            <option value="employe">Employé</option>
            <option value="responsable">Responsable</option>
            <option value="superviseur">Superviseur</option>
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Ajouter
          </button>
        </form>
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Nom</th>
              <th className="p-2">Prénom</th>
              <th className="p-2">Identifiant</th>
              <th className="p-2">Rôle</th>
              <th className="p-2">Changer le rôle</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="p-2">{user.nom}</td>
                <td className="p-2">{user.prenom}</td>
                <td className="p-2">{user.identifiant}</td>
                <td className="p-2">{user.role}</td>
                <td className="p-2">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="p-1 border rounded"
                  >
                    <option value="employe">Employé</option>
                    <option value="responsable">Responsable</option>
                    <option value="superviseur">Superviseur</option>
                  </select>
                </td>
                <td className="p-2">
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AuthGuard>
  );
}
