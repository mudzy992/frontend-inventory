import React, { useEffect, useState } from "react";
import { Avatar, Button, Descriptions, message } from "antd";
import EditUserForm from "./EditUserForm";
import UserType from "../../../../types/UserType";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useApi } from "../../../../API/api";
import { PhoneOutlined, CloseOutlined } from "@ant-design/icons";

const UserDetails: React.FC<{ data: UserType; onRefresh?: () => void }> = ({ data, onRefresh }) => {
  const { api } = useApi();
  const { role, phoneIp } = useUserContext();
  const [userData, setUserData] = React.useState(data);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [size, setSize] = useState<'default' | 'small'>('default')
  const [isCalling, setIsCalling] = useState(false);

  useEffect(() => {
    setUserData(data); 
  }, [data]);

  useEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth <= 768 ? 'small' : 'default');
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const refreshData = async () => {
    try {
      const response = await api(`api/user/${data.userId}`, "get", {}, role as UserRole);
      setUserData(response.data);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Greška pri osvježavanju podataka korisnika:", error);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const genderColor = userData.gender === "muško" ? "lightblue" : "lightpink";
  
  const initials = userData.forname && userData.surname
  ? `${userData.forname[0].toUpperCase()}${userData.surname[0].toUpperCase()}`
  : "";


  let lastActivityText;

  if (userData.lastLoginDate) {
    const currentDateTime = new Date();
    const lastLoginDateTime = new Date(userData.lastLoginDate);
    if (!isNaN(currentDateTime.getTime()) && !isNaN(lastLoginDateTime.getTime())) {
      const timeDifference = currentDateTime.getTime() - lastLoginDateTime.getTime();
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      if (minutesDifference < 1) {
        lastActivityText = `Posljednja aktivnost: prije manje od minut!`;
      } else if (minutesDifference < 60) {
        lastActivityText = `Posljednja aktivnost: prije ${minutesDifference} minuta`;
      } else if (hoursDifference < 60) {
        lastActivityText = `Posljednja aktivnost: prije ${hoursDifference} sati i ${minutesDifference % 60} minuta`;
      } else {
        lastActivityText = `Posljednja aktivnost: prije ${dayDifference} dana i ${hoursDifference % 24} sati`;
      }
    } else {
      lastActivityText = "Neispravan datum i vrijeme!";
    }
  } else {
    lastActivityText = "Nema prijava!";
  }

  const handleCall = async () => {
    if (!phoneIp || (!userData.localNumber && !userData.telephone)) return;
  
    const availableNumber = userData.localNumber || userData.telephone;
    const username = "admin";
    const password = "epbih";
  
    try {
      const response = await fetch(`http://${phoneIp}/servlet?key=number=${availableNumber}`, {
        mode: 'no-cors',
        method: "GET",
        headers: {
          "Authorization": "Basic " + btoa(`${username}:${password}`)
        }
      });
  
      if (!response.ok) throw new Error(`Greška pri pozivu! Status: ${response.status}`);
  
      console.log("✅ Poziv pokrenut!");
    } catch (error) {
      console.error("❌ Greška pri upućivanju poziva:", error);
    }
  };
  
    const handleEndCall = () => {
      if (!phoneIp) return;
    
      fetch(`http://${phoneIp}/servlet?key=CallEnd`)
        .then(() => {
          console.log("Poziv prekinut");
          setIsCalling(false); // Resetujemo stanje poziva
        })
        .catch((error) => {
          console.error("Greška pri prekidu poziva:", error);
        });
    };
  
    const renderCallButton = () => {
      if (!phoneIp || (!userData.localNumber && !userData.telephone)) return null;
    
      return (
        <Button
          type="primary"
          shape="circle"
          icon={isCalling ? <CloseOutlined /> : <PhoneOutlined />}
          onClick={isCalling ? handleEndCall : handleCall}
          style={{ position: "absolute", top: 10, left: 10 }}
        />
      );
    };

  return (
    <div className="">
      <div className="flex flex-col lg:flex-row gap-3 lg:p-2">
        <div className="lg:w-[35%] flex flex-col items-center justify-center col-span-2 rounded-lg border-0 bg-gradient-to-r from-cyan-500 to-blue-500">
          <div className="text-md flex flex-col items-center w-full p-4">
            {renderCallButton()}
            <Avatar
              className="w-[150px] h-[150px] text-5xl"
              style={{ border: `10px solid ${genderColor}` }}
            >{initials}</Avatar>
            <div style={{ fontSize: "25px", fontWeight: "bold", marginTop: "5px" }}>
              {userData.fullname}
            </div>
            <div style={{ fontSize: "14px" }}>{userData.email}</div>
            <div style={{ fontSize: "14px" }}>{userData.job?.title}</div>
          </div>
          <div className="w-full p-2 grid grid-rows-2 text-xs">
            <span>
              <i className="bi bi-calendar3" /> {lastActivityText}
            </span>
            <span>
              <i className="bi bi-award" /> Status: {userData.status}
            </span>
          </div>
        </div>
        <div className="w-full">
        <Descriptions
            size={size}
            bordered
            column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2 }}
            className="gap-3 lg:text-medium text-small"
          >
            <Descriptions.Item label="Prezime i ime">{userData.fullname}</Descriptions.Item>
            <Descriptions.Item label="Kadrovski broj">{userData.code}</Descriptions.Item>
            <Descriptions.Item label="Email">{userData.email}</Descriptions.Item>
            <Descriptions.Item label="Telefon">{userData.telephone}</Descriptions.Item>
            <Descriptions.Item label="Telefon/lokal">{userData.localNumber}</Descriptions.Item>
            <Descriptions.Item label="Sektor">{userData.department?.title}</Descriptions.Item>
            <Descriptions.Item label="Radno mjesto">{userData.job?.title}</Descriptions.Item>
            <Descriptions.Item label="Lokacija">{userData.location?.name}</Descriptions.Item>
          </Descriptions>

          <div className="py-3 flex w-full justify-end">
            <Button color="primary" variant="outlined" onClick={openModal}>
              Izmijeni podatke
            </Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditUserForm
          userId={Number(userData.userId)}
          onClose={closeModal}
          onSuccess={refreshData}
        />
      )}
    </div>
  );
};

export default UserDetails;
