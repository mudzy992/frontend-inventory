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

  return (
    <div className="container mx-auto">
      <div className="grid grid-cols-6 gap-3 lg:p-2">
        <div className="flex flex-col items-center justify-center col-span-2 rounded-lg border-0 bg-gradient-to-r from-cyan-500 to-blue-500">
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
        </div>
        <div className="col-span-4 lg:pl-4">
          <div className="grid grid-cols-3 gap-3">
            <div><strong>Ime:</strong> {data.forname}</div>
            <div><strong>Prezime:</strong> {data.surname}</div>
            <div><strong>Kadrovski broj:</strong> {data.code}</div>
            <div><strong>Email:</strong> {data.email}</div>
            <div><strong>Telefon:</strong> {data.telephone}</div>
            <div><strong>Telefon/lokal:</strong> {data.localNumber}</div>
            <div><strong>Sektor:</strong> {data.department?.title}</div>
            <div><strong>Radno mjesto:</strong> {data.job?.title}</div>
            <div><strong>Lokacija:</strong> {data.location?.name}</div>
          </div>
          <div className="mt-4">
            <Button onClick={openModal}>Izmijeni podatke</Button>
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
