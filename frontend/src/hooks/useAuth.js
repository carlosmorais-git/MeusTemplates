import { useEffect, useState } from "react";
import apiService from "@/services/api";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    apiService
      .getCurrentUser()
      .then((res) => {
        // Se o request retornar um objeto com status 401, não está autenticado
        if (res && res.status === 401) {
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(true);
        }
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  return isAuthenticated;
}
