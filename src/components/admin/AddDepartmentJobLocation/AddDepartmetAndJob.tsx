import React, { useEffect, useState } from "react";
import api, { ApiResponse } from "../../../API/api";
import RoledMainMenu from "../../RoledMainMenu/RoledMainMenu";
import AdminMenu from "../AdminMenu/AdminMenu";
import { Alert } from "../../custom/Alert";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";
/* import { Redirect } from 'react-router-dom'; */

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId: number;
}

interface JobType {
  jobId: number;
  title: string;
  description: string;
  jobCode: string;
}

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}
interface AddDepartmentAndJobState {
  message?: string;
  departmentBase: DepartmentType[];
  jobBase: JobType[];
  locationBase: LocationType[];
  isLoggedIn: boolean;
  add: {
    department: {
      title: string;
      description: string;
      departmentCode: string;
      parentDepartmentId?: number;
    };
    job: {
      title: string;
      description: string;
      jobCode: string;
    };
    location: {
      name: string;
      code: string;
      parentLocationId?: number;
    };
    departmentJobLocation: {
      departmentId: number;
      jobId: number;
      locationId: number;
    };
  };
}

const AddDepartmentAndJob: React.FC = () => {
  const [state, setState] = useState<AddDepartmentAndJobState>({
    departmentBase: [],
    jobBase: [],
    locationBase: [],
    isLoggedIn: true,
    add: {
      department: {
        title: "",
        description: "",
        departmentCode: "",
      },
      job: {
        title: "",
        description: "",
        jobCode: "",
      },
      location: {
        name: "",
        code: "",
      },
      departmentJobLocation: {
        departmentId: 0,
        jobId: 0,
        locationId: 0,
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    getData();
  }, []);

  /* SET */

  const setAddNewDepartmentStringState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        ...prevState.add,
        department: {
          ...prevState.add.department,
          [fieldName]: newValue,
        },
      },
    }));
  };

  const setAddNewJobStringState = (fieldName: string, newValue: string) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        ...prevState.add,
        job: {
          ...prevState.add.job,
          [fieldName]: newValue,
        },
      },
    }));
  };

  const setAddNewLocationStringState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        ...prevState.add,
        location: {
          ...prevState.add.location,
          [fieldName]: newValue,
        },
      },
    }));
  };

  const setAddNewDepartmentJobLocationStringState = (
    fieldName: string,
    newValue: string,
  ) => {
    setState((prevState) => ({
      ...prevState,
      add: {
        ...prevState.add,
        departmentJobLocation: {
          ...prevState.add.departmentJobLocation,
          [fieldName]: newValue,
        },
      },
    }));
  };

  const setErrorMessage = (message: string) => {
    setState((prev) => ({ ...prev, message: message }));
  };

  const setIsLoggedInStatus = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn: isLoggedIn }));
  };

  const setDepartmentData = (departmentData: DepartmentType[]) => {
    setState(
      Object.assign(state, {
        departmentBase: departmentData,
      }),
    );
  };

  const setJobData = (jobData: JobType[]) => {
    setState(
      Object.assign(state, {
        jobBase: jobData,
      }),
    );
  };

  const setLocationData = (locationData: LocationType[]) => {
    setState(
      Object.assign(state, {
        locationBase: locationData,
      }),
    );
  };

  const getData = async () => {
    try {
      setLoading(true);
      await api(
        "api/department?sort=title,ASC",
        "get",
        {},
        "administrator",
      ).then((res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom učitavanja sektora/službei/odjeljenja.",
          );
          return;
        }
        setDepartmentData(res.data);
      });

      api("api/job?sort=title,ASC", "get", {}, "administrator").then(
        (res: ApiResponse) => {
          if (res.status === "login") {
            setIsLoggedInStatus(false);
            return;
          }
          if (res.status === "error") {
            setErrorMessage("Greška prilikom učitavanja radnih mjesta.");
            return;
          }
          setJobData(res.data);
        },
      );

      api("api/location?sort=name,ASC", "get", {}, "administrator").then(
        (res: ApiResponse) => {
          if (res.status === "login") {
            setIsLoggedInStatus(false);
            return;
          }
          if (res.status === "error") {
            setErrorMessage("Greška prilikom učitavanja lokacija.");
            return;
          }
          setLocationData(res.data);
        },
      );
      setLoading(false);
    } catch (err) {
      setErrorMessage(
        "Došlo je do greške prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.",
      );
      setLoading(false);
    }
  };

  /* DODATNE FUNCKIJE */
  const printOptionalMessage = () => {
    if (state.message === "") {
      return;
    }

    return <Alert title="info" variant="info" body={state.message!} />;
  };

  const doAddDepartment = () => {
    api("api/department/", "post", state.add.department, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage(
            "Greška prilikom dodavanja sektora/službe/odjeljenja.",
          );
          return;
        }
        setErrorMessage("Uspješno dodan sektor/služba/odjeljenje");
        getData();
      },
    );
  };

  const doAddJob = () => {
    api("api/job/", "post", state.add.job, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage("Greška prilikom dodavanja radnog mjesta.");
          return;
        }
        setErrorMessage("Uspješno dodano radno mjesto");
        getData();
      },
    );
  };

  const doAddLocation = () => {
    api("api/location/", "post", state.add.location, "administrator").then(
      (res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage("Greška prilikom dodavanja lokacije.");
          return;
        }
        setErrorMessage("Uspješno dodana lokacija");
        getData();
      },
    );
  };

  const doAddDepartmentJobLocation = () => {
    api(
      "api/departmentJob/",
      "post",
      state.add.departmentJobLocation,
      "administrator",
    ).then((res: ApiResponse) => {
      if (res.status === "login") {
        setIsLoggedInStatus(false);
        return;
      }
      if (res.status === "error") {
        setErrorMessage(
          "Greška prilikom dodavanja sektora/službe/odjeljenja, pripadajućeg radnog mjesta te lokacije.",
        );
        return;
      }
      setErrorMessage(
        "Uspješno dodan sektor/služba/odjeljenje, pripadajuće radno mjesto te lokacija",
      );
      getData();
    });
  };

  const addForm = () => {
    return (
      <div>
        <Card className="mb-3">
          <CardHeader>Detalji sektora/službe/odjeljenja</CardHeader>
          <CardBody>
            <div className="flex flex-col">
              <div className="mb-3 mr-3 w-full">
                <Input
                  id="departmentTitle"
                  type="text"
                  label="Naziv sektora/službe/odjeljenja"
                  labelPlacement="inside"
                  value={state.add.department.title}
                  onChange={(e) =>
                    setAddNewDepartmentStringState("title", e.target.value)
                  }
                ></Input>
              </div>
              <div className="mb-3 mr-3 w-full">
                <Textarea
                  id="departmentDescription"
                  label="Opis"
                  placeholder="Opišite radno mjesto"
                  value={state.add.department.description}
                  onChange={(e) =>
                    setAddNewDepartmentStringState(
                      "description",
                      e.target.value,
                    )
                  }
                />
              </div>
              <div className="mb-3 mr-3 w-full">
                <Input
                  id="departmentCode"
                  type="number"
                  label="Šifra organizacione jedinice"
                  labelPlacement="inside"
                  value={state.add.department.departmentCode}
                  onChange={(e) =>
                    setAddNewDepartmentStringState(
                      "departmentCode",
                      e.target.value,
                    )
                  }
                ></Input>
              </div>
              <div className="w-full lg:flex">
                <Select
                  description="U slučaju da se kreira sektor nije potrebno popuniti polje ispod. Polje se popunjava
                                isključivo ako se dodaje služba/odjeljenje koje pripada nekom sektoru/službi."
                  id="parentDepartmentId"
                  label="Pripada sektoru/službi"
                  placeholder="Odaberite glavna službu/odjeljenje"
                  onChange={(e) =>
                    setAddNewDepartmentStringState(
                      "parentDepartmentId",
                      e.target.value,
                    )
                  }
                >
                  {state.departmentBase.map((departmentData, index) => (
                    <SelectItem
                      key={departmentData.departmentId || index}
                      textValue={`${departmentData.departmentId} - ${departmentData.title}`}
                      value={Number(departmentData.departmentId)}
                    >
                      {departmentData.departmentId} - {departmentData.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
          <CardFooter className={state.add.department.title ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddDepartment()} color="success">
                <i className="bi bi-plus-circle" /> Dodaj
                sektor/službu/odjeljenje
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Card className="mb-3">
          <CardHeader>Detalji radnog mjesta</CardHeader>
          <CardBody>
            <div className="flex flex-col">
              <div className="mb-3 mr-3 w-full">
                <Input
                  id="jobTitle"
                  type="text"
                  label="Naziv radnog mjesta"
                  labelPlacement="inside"
                  value={state.add.job.title}
                  onChange={(e) => {
                    setAddNewJobStringState("title", e.target.value);
                  }}
                ></Input>
              </div>
              <div className="mb-3 mr-3 w-full">
                <Textarea
                  id="jobDescription"
                  label="Opis"
                  placeholder="Opišite radno mjesto"
                  value={state.add.job.description}
                  onChange={(e) =>
                    setAddNewJobStringState("description", e.target.value)
                  }
                />
              </div>
              <div className="w-full lg:flex">
                <Input
                  id="jobCode"
                  type="text"
                  label="Šifra radnog mjesta"
                  labelPlacement="inside"
                  value={state.add.job.jobCode}
                  onChange={(e) =>
                    setAddNewJobStringState("jobCode", e.target.value)
                  }
                ></Input>
              </div>
            </div>
          </CardBody>
          <CardFooter className={state.add.job.title ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddJob()} color="success">
                <i className="bi bi-plus-circle" /> Dodaj radno mjesto
              </Button>
            </div>
          </CardFooter>
        </Card>
        <Card className="mb-3">
          <CardHeader>Detalji lokacije</CardHeader>
          <CardBody>
            <div className="flex flex-col">
              <div className="mb-3 mr-3 w-full">
                <Input
                  id="name"
                  type="text"
                  label="Naziv lokacije"
                  labelPlacement="inside"
                  value={state.add.location.name}
                  onChange={(e) =>
                    setAddNewLocationStringState("name", e.target.value)
                  }
                ></Input>
              </div>
              <div className="mb-3 mr-3 w-full">
                <Input
                  id="code"
                  type="text"
                  label="Šifra lokacije"
                  labelPlacement="inside"
                  value={state.add.location.code}
                  onChange={(e) =>
                    setAddNewLocationStringState("code", e.target.value)
                  }
                ></Input>
              </div>
              <div className="w-full lg:flex">
                <Select
                  description="Opciju koristiti u slučaju da lokacija ne postoji, pa se dodaje pod-lokacija"
                  id="parentLocationId"
                  label="Glavna lokacija"
                  placeholder="Odaberite glavna lokacija"
                  onChange={(e) =>
                    setAddNewLocationStringState(
                      "parentLocationId",
                      e.target.value,
                    )
                  }
                >
                  {state.locationBase.map((locData, index) => (
                    <SelectItem
                      key={locData.locationId || index}
                      textValue={`${locData.locationId} - ${locData.name}`}
                      value={Number(locData.locationId)}
                    >
                      {locData.locationId} - {locData.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
          <CardFooter className={state.add.location.name ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddLocation()} color="success">
                <i className="bi bi-plus-circle" /> Dodaj lokaciju
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="mb-3">
          <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
            Povezivanje
            <small className="text-default-500">
              U ovoj formi izvršavate povezivanje sektora/službe/odjeljenja sa
              pripadajućim radnim mjesto te lokacijom
            </small>
          </CardHeader>

          <CardBody>
            <div className="flex flex-col">
              <div className="mb-3 w-full lg:flex">
                <Select
                  id="departmentId"
                  label="Sektor/služba/odjeljenje"
                  placeholder="Odaberite Sektor/služba/odjeljenje"
                  value={state.add.departmentJobLocation?.departmentId}
                  onChange={(e) =>
                    setAddNewDepartmentJobLocationStringState(
                      "departmentId",
                      e.target.value,
                    )
                  }
                >
                  {state.departmentBase.map((departmentData, index) => (
                    <SelectItem
                      key={departmentData.departmentId || index}
                      textValue={`${departmentData.departmentId} - ${departmentData.title}`}
                      value={Number(departmentData.departmentId)}
                    >
                      {departmentData.departmentId} - {departmentData.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div
                className={`mb-3 w-full lg:flex ${state.add.departmentJobLocation?.departmentId ? "" : "hidden"}`}
              >
                <Select
                  id="jobTitleSelector"
                  label="Naziv radnog mjesta"
                  placeholder="Odaberite radno mjesto"
                  onChange={(e) => {
                    setAddNewDepartmentJobLocationStringState(
                      "jobId",
                      e.target.value,
                    );
                  }}
                >
                  {state.jobBase.map((jobData, index) => (
                    <SelectItem
                      key={jobData.jobId || index}
                      textValue={`${jobData.jobId} - ${jobData.title}`}
                      value={Number(jobData.jobId)}
                    >
                      {jobData.jobId} - {jobData.title}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div
                className={`mb-3 w-full lg:flex ${state.add.departmentJobLocation?.jobId ? "" : "hidden"}`}
              >
                <Select
                  id="location"
                  label="Lokacija"
                  placeholder="Odaberite lokaciju"
                  onChange={(e) =>
                    setAddNewDepartmentJobLocationStringState(
                      "locationId",
                      e.target.value,
                    )
                  }
                >
                  {state.locationBase.map((locData, index) => (
                    <SelectItem
                      key={locData.locationId || index}
                      textValue={`${locData.locationId} - ${locData.name}`}
                      value={Number(locData.locationId)}
                    >
                      {locData.locationId} - {locData.name}
                    </SelectItem>
                  ))}
                </Select>
              </div>
            </div>
          </CardBody>
          <CardFooter
            className={
              state.add.departmentJobLocation?.locationId ? "" : "hidden"
            }
          >
            <div style={{ alignItems: "end" }}>
              <Button
                onClick={() => doAddDepartmentJobLocation()}
                color="success"
              >
                <i className="bi bi-plus-circle" /> Poveži{" "}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div>
      <RoledMainMenu />
      <div className="container mx-auto mt-3 h-max lg:px-4">
        {loading ? (
          <div className="flex h-screen items-center justify-center">
            <Spinner color="danger" label="Učitavanje..." labelColor="danger" />
          </div>
        ) : (
          addForm()
        )}

        <AdminMenu />
      </div>
    </div>
  );
};
export default AddDepartmentAndJob;
