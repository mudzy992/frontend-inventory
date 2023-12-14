import React, { useEffect, useState } from 'react';
import { useUserContext } from '../UserContext/UserContext';
import { removeIdentity } from '../../API/api';
import { useNavigate } from 'react-router-dom';

const LogOutPage: React.FC = () => {
  const [done, setDone] = useState<boolean>(false);
  const { role, setRole, setUserId } = useUserContext(); // Dobivanje trenutne uloge iz konteksta
  const navigate = useNavigate();

  useEffect(() => {
    const logout = async () => {
      if (role) {
        // Ako je uloga definirana, izvrši akciju odjave
        await removeIdentity(role);
        setRole(undefined); // Postavljamo ulogu na undefined
        setUserId(undefined); // Postavljamo korisnički ID na undefined
        setDone(true);
      }
    };

    logout();
  }, [role, setRole, setUserId]);

  useEffect(() => {
    if (done) {
      // Ovdje možete redirektirati ili prikazati poruku odjave
      navigate(`/login`);
    }
  }, [done, navigate]);

  return null;
};

export default LogOutPage;
