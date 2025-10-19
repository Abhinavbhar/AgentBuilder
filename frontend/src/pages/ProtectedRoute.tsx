import { type ReactNode, useEffect, useState } from "react";
import { useUserStore, type User } from "@/store/UseUserStore";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (user) return; // already logged in

      setLoading(true);
      try {
        const res = await fetch("http://localhost:8080/user/checkauth", {
          method: "GET",
          credentials: "include",
        });
        
        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          navigate("/signin");
        }
      } catch (err) {
        console.error(err);
        navigate("/signin");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [user, setUser, navigate]);

  if (loading || !user) {
    return <p>Loading...</p>; // or a spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute;
