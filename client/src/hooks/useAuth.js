import { useEffect, useState } from "react";
import axios from "axios";

const apiEndpoint = import.meta.env.VITE_API_URL;

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${apiEndpoint}/auth/me`, {
        withCredentials: true,
      })
      .then((response) => setUser(response.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Add logout action handler
  const logout = async () => {
    try {
      await axios.post(
        `${apiEndpoint}/auth/logout`,
        {},
        { withCredentials: true },
      );
      setUser(null);
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  return { user, loading, logout };
}
