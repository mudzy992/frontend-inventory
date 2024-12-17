import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import api from "../../../../API/api";
import DepartmentType from "../../../../types/DepartmentType";
import JobType from "../../../../types/JobType";
import LocationType from "../../../../types/LocationType";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../UserContext/UserContext";

type EditUserFormProps = {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
};

const EditUserForm: React.FC<EditUserFormProps> = ({ userId, onClose, onSuccess }) => {
  const { role } = useUserContext();
  const [formData, setFormData] = useState({
    forname: "",
    surname: "",
    email: "",
    localNumber: "",
    telephone: "",
    departmentId: 0,
    jobId: 0,
    locationId: 0,
    organizationId: 0,
    status: "",
    code: 0,
    gender: "",
  });
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [jobs, setJobs] = useState<JobType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, departmentsRes, locationsRes] = await Promise.all([
          api(`api/user/${userId}`, "get", {}, role as UserRole),
          api("api/department", "get", {}, role as UserRole),
          api("api/location", "get", {}, role as UserRole),
        ]);

        setFormData(userRes.data);
        setDepartments(departmentsRes.data);
        setLocations(locationsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [userId, role]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api(`api/user/${userId}`, "patch", formData, role as UserRole);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving user data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose}>
      <ModalHeader>Izmijeni korisničke podatke</ModalHeader>
      <ModalBody>
      <div className="grid grid-cols-3 gap-3">
          <Input
            label="Ime"
            value={formData.forname}
            onChange={(e) => setFormData({ ...formData, forname: e.target.value })}
          />
          <Input
            label="Prezime"
            value={formData.surname}
            onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Telefon"
            value={formData.telephone}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
          />
          <Input
            label="Telefon/lokal"
            value={formData.localNumber}
            onChange={(e) => setFormData({ ...formData, localNumber: e.target.value })}
          />
          <Input
            label="Kadrovski broj"
            type="number"
            value={formData.code.toString()}
            onChange={(e) => setFormData({ ...formData, code: +e.target.value })}
          />
          <Select
            label="Pol"
            value={formData.gender}
            onChange={(value:any) => setFormData({ ...formData, gender: value })}
          >
            <SelectItem value="muško" key={"muško"}>Muško</SelectItem>
            <SelectItem value="žensko" key={"žensko"}>Žensko</SelectItem>
          </Select>
          <Select
            label="Sektor"
            value={formData.departmentId.toString()}
            onChange={(value) => setFormData({ ...formData, departmentId: +value })}
          >
            {departments.map((dept) => (
              <SelectItem key={dept.departmentId!} value={dept.departmentId!.toString()}>
                {dept.title}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Radno mjesto"
            value={formData.jobId.toString()}
            onChange={(value) => setFormData({ ...formData, jobId: +value })}
          >
            {jobs.map((job) => (
              <SelectItem key={job.jobId!} value={job.jobId!.toString()}>
                {job.title}
              </SelectItem>
            ))}
          </Select>
          <Select
            label="Lokacija"
            value={formData.locationId.toString()}
            onChange={(value) => setFormData({ ...formData, locationId: +value })}
          >
            {locations.map((location) => (
              <SelectItem key={location.locationId!} value={location.locationId!.toString()}>
                {location.name}
              </SelectItem>
            ))}
          </Select>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onClose} color="danger">
          Otkaži
        </Button>
        <Button onClick={handleSave} isLoading={loading}>
          Sačuvaj
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default EditUserForm;
