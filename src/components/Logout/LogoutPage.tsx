import React, { useEffect, useState } from 'react';
import { useUserContext } from '../UserContext/UserContext';
import { removeIdentity } from '../../API/api';
import { useNavigate } from 'react-router-dom';

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
        setDone(true);
      }
    };

    logout();
  }, [role, setRole, setUserId]);

  useEffect(() => {
    if (done) {
      navigate(`/login`);
    }
  }, [done, navigate]);

  return null;
};

export default LogOutPage;
