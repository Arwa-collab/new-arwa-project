import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";

interface AuthGuardProps {
  allowedRoles: string[];
  children: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ allowedRoles, children }) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Simulate fetching user role from authentication service
    const fetchUserRole = async () => {
      // Replace with actual authentication logic
      const role = await getUserRole(); // Assume this function fetches the user role
      setUserRole(role);
    };

    fetchUserRole();
  }, []);

  useEffect(() => {
    if (userRole && !allowedRoles.includes(userRole)) {
      router.push("/"); // Redirect to home if user role is not allowed
    }
  }, [userRole, allowedRoles, router]);

  if (userRole === null) {
    return <div>Loading...</div>; // Show loading state while fetching user role
  }

  return <>{children}</>;
};

export default AuthGuard;

// Mock function to simulate fetching user role
const getUserRole = async (): Promise<string> => {
  // Replace this with actual logic to get user role
  return "responsable"; // Example role
};