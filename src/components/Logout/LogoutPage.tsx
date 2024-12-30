import React, { useEffect, useState } from "react";
import { removeIdentity, useUserContext } from "../UserContext/UserContext";
import { useNavigate } from "react-router-dom";

const LogOutPage: React.FC = () => {
  const { role, setRole, setUserId, setIsAuthenticated } = useUserContext();
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      if (role) {
        await removeIdentity();
        setIsAuthenticated(false)
        setRole(undefined);
        setUserId(undefined);

        navigate('/login')
      }
    };

    logout();
  }, [role, setRole, setUserId, setIsAuthenticated]);

  return null;
};

export default LogOutPage;
