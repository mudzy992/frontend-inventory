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
} from "@nextui-org/react";
import Toast from "../../custom/Toast";

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}
interface AddLocationState {
  message: {
    message: string;
    variant: string;
  };
  locationBase: LocationType[];
  isLoggedIn: boolean;
  add: {
    location: {
      name: string;
      code: string;
      parentLocationId?: number;
    };
  };
}

const AddLocation: React.FC = () => {
  const [state, setState] = useState<AddLocationState>({
    message: {message: "", variant: ""},
    isLoggedIn: true,
    locationBase: [],
    add: {
      location: {
        name: "",
        code: "",
      },
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getLocations();
  }, []);

  /* SET */

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

  const setErrorMessage = (message: string, variant: string) => {
    setState((prev) => ({
      ...prev,
      message: { message, variant },
    }));
  };

  const setIsLoggedInStatus = (isLoggedIn: boolean) => {
    setState((prev) => ({ ...prev, isLoggedIn: isLoggedIn }));
  };

  const setLocationData = (locationData: LocationType[]) => {
    setState(
      Object.assign(state, {
        locationBase: locationData,
      }),
    );
  };

  /* GET */

  const getLocations = async () => {
    try {
      setLoading(true);
      await api("api/location?sort=name,ASC", "get", {}, "administrator").then(
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
          setLoading(false);
        },
      );
    } catch (error) {
      setErrorMessage("Greška prilikom učitavanja lokacija.", "danger");
      setLoading(false);
    }
  };

  const doAddLocation = async () => {
    try {
      setLoading(true);
      await api(
        "api/location/",
        "post",
        state.add.location,
        "administrator",
      ).then((res: ApiResponse) => {
        if (res.status === "login") {
          setIsLoggedInStatus(false);
          return;
        }
        if (res.status === "error") {
          setErrorMessage("Greška prilikom dodavanja lokacije.", "danger");
          return;
        }
        setErrorMessage("Uspješno dodana lokacija", "success");
        getLocations();
        setLoading(false);
      });
    } catch (error) {
      setErrorMessage("Greška prilikom dodavanja lokacije.", "danger");
    }
  };

  const addForm = () => {
    return (
      <ModalContent>
        <ModalHeader>Detalji lokacije</ModalHeader>
        <ModalBody>
          <div className="flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center">
                <Spinner
                  label="Učitavanje..."
                  labelColor="success"
                  color="success"
                />
              </div>
            ) : (
              <div>
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
            )}
          </div>
          <ModalFooter className={state.add.location.name ? "" : "hidden"}>
            <div style={{ alignItems: "end" }}>
              <Button onClick={() => doAddLocation()} color="success">
                <i className="bi bi-plus-circle" /> Dodaj lokaciju
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

export default AddLocation;
