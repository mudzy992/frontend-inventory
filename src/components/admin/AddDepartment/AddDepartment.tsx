import React, { useEffect, useState } from "react";
import api, { ApiResponse } from "../../../API/api";
import {
  Button,
  Input,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import Toast from "../../custom/Toast";

interface DepartmentType {
  departmentId: number;
  title: string;
  description: string;
  departmentCode: string;
  parentDepartmentId: number;
}

interface AddDepartmentState {
  message: {
    message: string;
    variant: string;
  };
  departmentBase: DepartmentType[];
  isLoggedIn: boolean;
  add: {
    department: {
      title: string;
      description: string;
      departmentCode: string;
      parentDepartmentId?: number;
    };
  };
}

const AddDepartment: React.FC = () => {
  const [state, setState] = useState<AddDepartmentState>({
    message: {
      message: "",
      variant: "",
    },
    departmentBase: [],
    isLoggedIn: true,
    add: {
      department: {
        title: "",
        description: "",
        departmentCode: "",
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getDepartments();
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

  /* GET */

  const getDepartments = async () => {
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
        setLoading(false);
      });
    } catch (error) {
      setErrorMessage(
        "Greška prilikom učitavanja sektora/službei/odjeljenja.",
        "danger",
      );
      setLoading(false);
    }
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
            "danger",
          );
          return;
        }
        setErrorMessage("Uspješno dodan sektor/služba/odjeljenje", "success");
        getDepartments();
      },
    );
  };

  const addForm = () => {
    return (
      <ModalContent>
        <ModalHeader>Detalji sektora/službe/odjeljenja</ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner
                  color="success"
                  label="Učitavanje..."
                  labelColor="success"
                />
              </div>
            ) : (
              <div>
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
            )}
          </div>
          <ModalFooter className={state.add.department.title ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddDepartment()} color="success">
                <i className="bi bi-plus-circle" /> Dodaj
                sektor/službu/odjeljenje
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
          variant={state.message.variant}
          message={state.message.message}
        />
      </div>
    </div>
  );
};
export default AddDepartment;
