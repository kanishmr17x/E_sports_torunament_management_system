import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const UserList = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAdmin) {
      navigate("/admin/users", { replace: true });
    } else {
      navigate("/players", { replace: true });
    }
  }, [isAdmin, navigate]);

  return null;
};

export default UserList;
