import React, { useEffect, useState } from "react";
import api, { ApiResponse } from "../../../API/api";
import {
  Button,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
} from "@nextui-org/react";
import Toast from "../../custom/Toast";

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
interface AddDepartmentJobLocationState {
  message: {
    message: string;
    variant: string;
  };
  departmentBase: DepartmentType[];
  jobBase: JobType[];
  locationBase: LocationType[];
  isLoggedIn: boolean;
  add: {
    departmentJobLocation: {
      departmentId: number;
      jobId: number;
      locationId: number;
    };
  };
}

const AddDepartmentJobLocation: React.FC = () => {
  const [state, setState] = useState<AddDepartmentJobLocationState>({
    message: {message: "", variant: ""},
    departmentBase: [],
    jobBase: [],
    locationBase: [],
    isLoggedIn: true,
    add: {
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

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
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

  /* GET */

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
            "danger",
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
            setErrorMessage(
              "Greška prilikom učitavanja radnih mjesta.",
              "danger",
            );
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
            setErrorMessage("Greška prilikom učitavanja lokacija.", "danger");
            return;
          }
          setLocationData(res.data);
        },
      );
      setLoading(false);
    } catch (err) {
      setErrorMessage(
        "Došlo je do greške prilikom učitavanja kategorija, osvježite stranicu i pokušajte ponovo.",
        "danger",
      );
      setLoading(false);
    }
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
          "danger",
        );
        return;
      }
      setErrorMessage(
        "Uspješno dodan sektor/služba/odjeljenje, pripadajuće radno mjesto te lokacija",
        "success",
      );
      getData();
    });
  };

  const addForm = () => {
    return (
      <ModalContent>
        <ModalHeader>
          Modul povezivanja radnog mjesta sa sektorom i lokacijom
        </ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex h-screen items-center justify-center">
                <Spinner color="success" />
              </div>
            ) : (
              <div>
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
            )}
          </div>
          <ModalFooter
            className={
              state.add.departmentJobLocation?.locationId ? "" : "hidden"
            }
          >
            <div style={{ alignItems: "end" }}>
              <Button
                onClick={() => doAddDepartmentJobLocation()}
                color="success"
              >
                <i className="bi bi-node-plus" /> Poveži{" "}
              </Button>
            </div>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    );
  };

  return (
    <div>
      <div>
        {addForm()}
        <Toast
          variant={state.message?.variant}
          message={state.message?.message}
        />
      </div>
    </div>
  );
};
export default AddDepartmentJobLocation;
