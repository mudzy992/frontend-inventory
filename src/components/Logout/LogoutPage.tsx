import React, { useEffect, useState } from "react";
import { removeIdentity, useUserContext } from "../UserContext/UserContext";
import { useNavigate } from "react-router-dom";

const LogOutPage: React.FC = () => {
  const { role, setRole, setUserId, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      if (role) {
        await removeIdentity(setIsAuthenticated, setUserId, setRole);
        navigate('/login')
      }
    };

    logout();
  }, [role, setRole, setUserId]);

  return null;
};

export default LogOutPage;
