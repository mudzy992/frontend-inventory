import React, { useEffect, useState } from 'react';
import { useUserContext } from '../UserContext/UserContext';
import { removeIdentity } from '../../API/api';
import { useNavigate } from 'react-router-dom';

const LogOutPage: React.FC = () => {
  const [done, setDone] = useState<boolean>(false);
  const { role } = useUserContext(); // Dobivanje trenutne uloge iz konteksta
  const navigate = useNavigate();

  useEffect(() => {
    if (role) {
      // Ako je uloga definirana, izvrši akciju odjave
      removeIdentity(role);
      setDone(true);
    }
  }, [role]);

  if (done) {
    // Ovdje možete redirektirati ili prikazati poruku odjave
    navigate(`/login`);
  }

  return null;
};

export default LogOutPage;

