import React from "react";
import { Avatar, Button } from "@nextui-org/react";
import EditUserForm from "./EditUserForm";
import UserType from "../../../../types/UserType";

type UserProps = {
  data: UserType;
  onRefresh?: () => void;
};

const UserDetails: React.FC<UserProps> = ({ data, onRefresh }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const genderColor = data.gender === "muško" ? "lightblue" : "lightpink";

  let lastActivityText;

  if (data.lastLoginDate) {
    const currentDateTime = new Date();
    const lastLoginDateTime = new Date(data.lastLoginDate);
    if (
      !isNaN(currentDateTime.getTime()) &&
      !isNaN(lastLoginDateTime.getTime())
    ) {
      const timeDifference =
        currentDateTime.getTime() - lastLoginDateTime.getTime();
      const minutesDifference = Math.floor(timeDifference / (1000 * 60));
      const hoursDifference = Math.floor(timeDifference / (1000 * 60 * 60));
      const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
      if (minutesDifference < 1) {
        lastActivityText = `Posljednja aktivnost: prije manje od minut!`;
      } else if (minutesDifference < 60) {
        lastActivityText = `Posljednja aktivnost: prije ${minutesDifference} minuta`;
      } else if (hoursDifference < 60) {
        lastActivityText = `Posljednja aktivnot: prije ${hoursDifference} sati i ${minutesDifference % 60} minuta`;
      } else {
        lastActivityText = `Posljednja aktivnost: prije ${dayDifference} dana i ${hoursDifference % 24} sati`;
      }
    } else {
      lastActivityText = "Neispravan datum i vrijeme!";
    }
  } else {
    lastActivityText = "Nema prijava!";
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col lg:flex-row gap-3 lg:p-2">
        <div className="lg:w-[35%] flex flex-col items-center justify-center col-span-2 rounded-lg border-0 bg-gradient-to-r from-cyan-500 to-blue-500">
          <div className="text-md flex flex-col items-center w-full p-4">
            <Avatar
              className="w-[150px] h-[150px]"
              style={{ border: `10px solid ${genderColor}` }}
            />
            <div style={{ fontSize: "25px", fontWeight: "bold", marginTop: "5px" }}>
              {data.fullname}
            </div>
            <div style={{ fontSize: "14px" }}>{data.email}</div>
            <div style={{ fontSize: "14px" }}>{data.job?.title}</div>
          </div>
          <div className="w-full p-2 grid grid-rows-2 text-xs">
              <span><i className="bi bi-calendar3" /> {lastActivityText}</span>
              <span><i className="bi bi-award" /> Status: {data.status}</span>
          </div>
        </div>
        <div className="w-full">
          <div className="grid lg:grid-cols-2 gap-3 lg:text-medium text-small">
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Prezime i ime:</strong> {data.fullname}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Kadrovski broj:</strong> {data.code}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Email:</strong> {data.email}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Telefon:</strong> {data.telephone}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Telefon/lokal:</strong> {data.localNumber}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Sektor:</strong> {data.department?.title}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Radno mjesto:</strong> {data.job?.title}</div>
            <div className="grid grid-rows-2 bg-[#3f3f46] p-3 rounded-2xl"><strong>Lokacija:</strong> {data.location?.name}</div>
          </div>
          <div className="mt-4">
            <Button onPress={openModal}>Izmijeni podatke</Button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <EditUserForm
          userId={Number(data.userId)}
          onClose={closeModal}
          onSuccess={onRefresh!}
        />
      )}
    </div>
  );
};

export default UserDetails;
