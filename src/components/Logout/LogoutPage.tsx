import React, { useEffect, useState } from "react";
import { useUserContext } from "../UserContext/UserContext";
import { removeIdentity } from "../../API/api";
import { useNavigate } from "react-router-dom";

const LogOutPage: React.FC = () => {
  const [done, setDone] = useState<boolean>(false);
  const { role, setRole, setUserId } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      if (role) {
        await removeIdentity();
        setRole(undefined);
        setUserId(undefined);
        navigate('/')
      }
    };

    logout();
  }, [role, setRole, setUserId]);

  return null;
};

export default LogOutPage;
