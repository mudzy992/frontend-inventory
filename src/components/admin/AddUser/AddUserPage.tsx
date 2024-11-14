import React, { useEffect, useState } from "react";
import api, { ApiResponse } from "../../../API/api";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import AdminMenu from "../AdminMenu/AdminMenu";
import LocationType from "../../../types/LocationType";
import DepartmentType from "../../../types/DepartmentType";
import JobType from "../../../types/JobType";
import AddDepartment from "../AddDepartment/AddDepartment";
import AddJob from "../AddJob/AddJob";
import AddLocation from "../AddLocation/AddLocation";
import AddDepartmentJobLocation from "./AddDepartmentJobLocation";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Link,
  Modal,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import Toast from "../../custom/Toast";

interface LocationDto {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}

interface JobBaseType {
  jobId: number;
  title: string;
  jobCode: string;
}
interface AddUserPageState {
  message: { message: string; variant: string };
  isLoggedIn: boolean;
  addUser: {
    surname: string;
    forname: string;
    email: string;
    localNumber: string;
    telephone: string;
    jobId: number;
    departmentId: number;
    locationId: number;
    password: string;
    status: string;
    code: number;
    gender: string;
    organizationId: number;
  };
  modal: {
    department: {
      visible: boolean;
    };
    job: {
      visible: boolean;
    };
    location: {
      visible: boolean;
    };
    departmentJobLocation: {
      visible: boolean;
    };
  };
  location: LocationType[];
  department: DepartmentType[];
  job: JobType[];
  errorMessage: string;
}
const AddUserPage: React.FC = () => {
  const [state, setState] = useState<AddUserPageState>({
    isLoggedIn: true,
    message: { message: "", variant: "" },
    addUser: {
      surname: "",
      forname: "",
      email: "",
      localNumber: "",
      telephone: "",
      jobId: Number(),
      departmentId: Number(),
      locationId: Number(),
      password: "",
      status: "",
      code: Number(),
      gender: '',
      organizationId: Number(),
    },
    modal: {
      department: {
        visible: false,
      },
      job: {
        visible: false,
      },
      location: {
        visible: false,
      },
      departmentJobLocation: {
        visible: false,
      },
    },
    location: [],
    department: [],
    job: [],
    errorMessage: "",
  });

  const navigate = useNavigate();
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  /* SET */
  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const setAddUserStringFieldState = (fieldName: string, newValue: string) => {
    setState((prev) => ({
      ...prev,
      addUser: { ...prev.addUser, [fieldName]: newValue },
    }));
  };

  const setAddUserNumberFieldState = (fieldName: string, newValue: any) => {
    setState((prev) => ({
      ...prev,
      addUser: {
        ...prev.addUser,
        [fieldName]: newValue === "null" ? null : Number(newValue),
      },
    }));
  };

  const setLocation = (location: LocationDto[]) => {
    const locData: LocationType[] = location.map((details) => {
      return {
        locationId: details.locationId,
        code: details.code,
        name: details.name,
        parentLocationId: details.parentLocationId,
      };
    });
    setState((prev) => ({ ...prev, location: locData }));
  };

  const setDepartment = (department: DepartmentType[]) => {
    setState((prev) => ({ ...prev, department: department }));
  };

  const addJobDepartmentChange = async (selectedValue: any) => {
    setAddUserNumberFieldState("departmentId", selectedValue);

    const jobs = await getJobsByDepartmentId(selectedValue);
    const stateJobs = jobs.map((job) => ({
      jobId: job.jobId,
      title: job.title,
      jobCode: job.jobCode,
    }));

    setState((prev) => ({ ...prev, job: stateJobs }));
  };

  const showDepartmentModal = async () => {
    setDepartmentModalVisibleState(true);
  };

  const setDepartmentModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      modal: {
        ...prev.modal,
        department: { ...prev.modal.department, visible: newState },
      },
    }));
    getData();
  };

  const showJobModal = async () => {
    setJobModalVisibleState(true);
  };

  const setJobModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      modal: { ...prev.modal, job: { ...prev.modal.job, visible: newState } },
    }));
    getData();
  };

  const showLocationModal = async () => {
    setLocationModalVisibleState(true);
  };

  const setLocationModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      modal: {
        ...prev.modal,
        location: { ...prev.modal.location, visible: newState },
      },
    }));
    getData();
  };

  const showDepartmentJobLocationModal = async () => {
    setDepartmentJobLocationModalVisibleState(true);
  };

  const setDepartmentJobLocationModalVisibleState = (newState: boolean) => {
    setState((prev) => ({
      ...prev,
      modal: {
        ...prev.modal,
        departmentJobLocation: {
          ...prev.modal.departmentJobLocation,
          visible: newState,
        },
      },
    }));
    getJobsByDepartmentId(state.addUser.departmentId);
  };

  const setLogginState = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn: isLoggedIn }));

    if (isLoggedIn === false) {
      navigate("/login/");
    }
  };

  /* Kraj SET */
  /* GET */
  const getData = () => {
    api("api/location?sort=name,ASC", "get", {}, "administrator").then(
      async (res: ApiResponse) => {
        if (res.status === "error") {
          setErrorMessage("Greška prilikom hvatanja lokacija", "danger");
        }
        if (res.status === "login") {
          return setLogginState(false);
        }
        setLocation(res.data);
      },
    );

    api("api/department?sort=title,ASC", "get", {}, "administrator").then(
      async (res: ApiResponse) => {
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom hvatanja sektora i odjeljenja",
            "danger",
          );
        }
        setDepartment(res.data);
      },
    );
  };

  useEffect(() => {
    getData();
  }, []);

  const getJobsByDepartmentId = async (
    departmentId: number,
  ): Promise<JobBaseType[]> => {
    return new Promise((resolve) => {
      api(
        `api/job/department/${departmentId}`,
        "get",
        {},
        "administrator",
      ).then((res: ApiResponse) => {
        if (res.status === "login") {
          return setLogginState(false);
        }
        if (res.status === "error") {
          setErrorMessage("Greška prilikom hvatanja radnih mjesta", "danger");
        }

        const jobs: JobBaseType[] = res.data.map((item: any) => ({
          jobId: item.jobId,
          title: item.title,
          jobCode: item.jobCode,
        }));
        resolve(jobs);
      });
    });
  };

  /* Kraj GET */
  const doAddUser = () => {
    api(
      "api/user/add/",
      "post",
      {
        surname: state.addUser.surname,
        forname: state.addUser.forname,
        password: state.addUser.password,
        email: state.addUser.email,
        localNumber: state.addUser.localNumber,
        telephone: state.addUser.telephone,
        jobId: state.addUser.jobId,
        departmentId: state.addUser.departmentId,
        locationId: state.addUser.locationId,
        status: state.addUser.status,
        code: state.addUser.code,
        gender: state.addUser.gender,
        organizationId: state.addUser.organizationId,
      },
      "administrator",
    ).then(async (res: ApiResponse) => {
      if (res.status === "login") {
        return setLogginState(false);
      }

      if (res.status === "ok") {
        setErrorMessage("Korisnik uspješno dodan", "success");
        setState((prev) => ({
          ...prev,
          addUser: {
            surname: "",
            forname: "",
            email: "",
            localNumber: "",
            telephone: "",
            jobId: Number(),
            departmentId: Number(),
            locationId: Number(),
            password: "",
            status: "",
            code: Number(),
            gender: "",
            organizationId: Number(),
          },
        }));
      }
    });
  };
  const addForm = () => {
    return (
      <div>
        <Card className="mb-3">
          <CardHeader>
            <i className="bi bi-person-lines-fill" /> Informacije o korisniku
          </CardHeader>
          <CardBody className="">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:flex">
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="surname"
                    type="text"
                    label="Ime"
                    labelPlacement="inside"
                    value={state.addUser.surname}
                    onChange={(e) =>
                      setAddUserStringFieldState("surname", e.target.value)
                    }
                  ></Input>
                </div>
                <div className="mb-3 w-full">
                  <Input
                    id="forname"
                    type="text"
                    label="Prezime"
                    labelPlacement="inside"
                    value={state.addUser.forname}
                    onChange={(e) =>
                      setAddUserStringFieldState("forname", e.target.value)
                    }
                  ></Input>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:flex">
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="email"
                    type="text"
                    label="Email"
                    labelPlacement="inside"
                    value={state.addUser.email}
                    onChange={(e) =>
                      setAddUserStringFieldState("email", e.target.value)
                    }
                  ></Input>
                </div>
                <div className="mb-3 w-full">
                  <Input
                    id="password"
                    endContent={
                      <button
                        className="focus:outline-none"
                        type="button"
                        onClick={toggleVisibility}
                      >
                        {isVisible ? (
                          <i className="bi bi-eye-fill pointer-events-none text-2xl text-default-400" />
                        ) : (
                          <i className="bi bi-eye-slash-fill pointer-events-none text-2xl text-default-400" />
                        )}
                      </button>
                    }
                    type={isVisible ? "text" : "password"}
                    label="Lozinka"
                    labelPlacement="inside"
                    value={state.addUser.password}
                    onChange={(e) =>
                      setAddUserStringFieldState("password", e.target.value)
                    }
                  ></Input>
                </div>
              </div>
            </div>
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:flex">
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="telephone"
                    type="text"
                    label="Telefon"
                    labelPlacement="inside"
                    value={state.addUser.telephone}
                    onChange={(e) =>
                      setAddUserStringFieldState("telephone", e.target.value)
                    }
                  ></Input>
                </div>
                <div className="mb-3 w-full">
                  <Input
                    id="local"
                    type="number"
                    label="Broj u lokalu"
                    labelPlacement="inside"
                    value={state.addUser.localNumber}
                    onChange={(e) =>
                      setAddUserStringFieldState("localNumber", e.target.value)
                    }
                  ></Input>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:flex">
                <div className="mb-3 mr-3 w-full">
                  <Input
                    id="code"
                    type="number"
                    label="Kadrovski broj"
                    labelPlacement="inside"
                    value={state.addUser.code.toString()}
                    onChange={(e) =>
                      setAddUserStringFieldState("code", e.target.value)
                    }
                  ></Input>
                </div>
                <div className="mb-3 mr-3 w-full">
                  <Select
                    id="gender"
                    label="Spol"
                    placeholder="Odaberite spol"
                    value={state.addUser.gender}
                    onChange={(e) =>
                      setAddUserStringFieldState("gender", e.target.value)
                    }
                  >
                    <SelectItem key={"muško"} value={"muško"}>
                      muško
                    </SelectItem>
                    <SelectItem key={"žensko"} value={"žensko"}>
                      žensko
                    </SelectItem>
                  </Select>
                </div>
                <div className="mb-3 mr-3 w-full">
                  <Select
                    id="status"
                    label="Status"
                    placeholder="Odaberite status"
                    value={state.addUser.status}
                    onChange={(e) =>
                      setAddUserStringFieldState("status", e.target.value)
                    }
                  >
                    <SelectItem key={"aktivan"} value={"aktivan"}>
                      aktivan
                    </SelectItem>
                    <SelectItem key={"neaktivan"} value={"neaktivan"}>
                      neaktivan
                    </SelectItem>
                  </Select>
                </div>
                <div className="mb-3 w-full">
                  <Select
                    id="organizacija"
                    label="Organizacija"
                    placeholder="Odaberite organizaciju"
                    value={state.addUser.organizationId}
                    onChange={(e) =>
                      setAddUserNumberFieldState("organizationId", e.target.value)
                    }
                  >
                    <SelectItem key={"1"} value={"1"}>
                      Distribucija
                    </SelectItem>
                    <SelectItem key={"2"} value={"2"}>
                      Snabdjevanje
                    </SelectItem>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex flex-row">
              <div className="flex w-full">
                <div className="mb-3 mr-3 w-full">
                  <Select
                    id="departmentId"
                    label="Sektor ili odjeljenje"
                    placeholder="Odaberite sektor ili odjeljenje"
                    onChange={(e) => {
                      setAddUserNumberFieldState(
                        "departmentId",
                        e.target.value,
                      );
                      addJobDepartmentChange(e.target.value);
                    }}
                  >
                    {state.department.map((dep, index) => (
                      <SelectItem
                        key={dep.departmentId || index}
                        textValue={dep.title}
                        value={Number(dep.departmentId)}
                      >
                        {" "}
                        {dep.title} - {dep.departmendCode}{" "}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="mb-3 flex items-center justify-center">
                  <Button
                    color="warning"
                    variant="flat"
                    size="lg"
                    onClick={() => showDepartmentModal()}
                  >
                    <i className="bi bi-plus-circle-fill" />
                  </Button>
                  <Modal
                    backdrop="blur"
                    size="lg"
                    isOpen={state.modal.department.visible}
                    onClose={() => setDepartmentModalVisibleState(false)}
                  >
                    <AddDepartment />
                  </Modal>
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="flex w-full">
                <div className="mb-3 mr-3 w-full">
                  <Select
                    id="jobId"
                    label="Radno mjesto"
                    placeholder="Odaberite radno mjesto"
                    onChange={(e) =>
                      setAddUserNumberFieldState("jobId", e.target.value)
                    }
                  >
                    {state.job.map((jo, index) => (
                      <SelectItem
                        key={jo.jobId || index}
                        textValue={jo.title}
                        value={jo.jobId}
                      >
                        {jo.jobCode} - {jo.title}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="mb-3 flex items-center justify-center">
                  <Button
                    color="warning"
                    variant="flat"
                    size="lg"
                    onClick={() => showJobModal()}
                  >
                    <i className="bi bi-plus-circle-fill" />
                  </Button>
                  <Modal
                    backdrop="blur"
                    size="lg"
                    isOpen={state.modal.job.visible}
                    onClose={() => setJobModalVisibleState(false)}
                  >
                    <AddJob />
                  </Modal>
                </div>
              </div>
            </div>
            <div className="mb-3 flex flex-col pl-3 text-sm text-default-500 lg:flex-row">
              Ukoliko je lista radnih mjesta prazna ili radno mjesto ne postoji
              u istoj, potrebno je izvršiti povezivanje radnog mjesta sa
              lokacijom i sektorom. To možete učiniti klikom
              <Link
                className="cursor-pointer pl-1 text-sm"
                color="danger"
                showAnchorIcon
                onClick={() => showDepartmentJobLocationModal()}
              >
                {" "}
                ovdje
              </Link>
              <Modal
                backdrop="blur"
                size="lg"
                isOpen={state.modal.departmentJobLocation.visible}
                onClose={() => setDepartmentJobLocationModalVisibleState(false)}
              >
                <AddDepartmentJobLocation />
              </Modal>
            </div>

            <div className="flex flex-col lg:flex-row">
              <div className="flex w-full">
                <div className="mb-3 mr-3 w-full">
                  <Select
                    id="locationId"
                    label="Lokacija"
                    placeholder="Odaberite lokaciju"
                    onChange={(e) =>
                      setAddUserNumberFieldState("locationId", e.target.value)
                    }
                  >
                    {state.location.map((loc, index) => (
                      <SelectItem
                        key={loc.locationId || index}
                        textValue={loc.name}
                        value={loc.locationId}
                      >
                        {loc.code} - {loc.name}{" "}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="mb-3 flex items-center justify-center">
                  <Button
                    color="warning"
                    variant="flat"
                    size="lg"
                    onClick={() => showLocationModal()}
                  >
                    <i className="bi bi-plus-circle-fill" />
                  </Button>
                  <Modal
                    backdrop="blur"
                    size="lg"
                    isOpen={state.modal.location.visible}
                    onClose={() => setLocationModalVisibleState(false)}
                  >
                    <AddLocation />
                  </Modal>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter className="gap-3">
            <div>
              <Button onClick={() => doAddUser()} color="success">
                {" "}
                <i className="bi bi-person-check-fill" />
                Dodaj korisnika
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };
  /* Kraj dodatnih funkcija */
  return (
    <div>
      <RoledMainMenu />

      <div className="container mx-auto mt-3 h-max lg:px-4">
        {addForm()}
        <Toast
          variant={state.message?.variant}
          message={state.message?.message}
        />
        <AdminMenu />
      </div>
    </div>
  );
};

export default AddUserPage;
