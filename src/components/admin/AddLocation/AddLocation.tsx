import React, { useEffect, useState } from "react";
import { useApi } from "../../../API/api";
import { Button, Input, Form, Select, Spin } from "antd";
import { useNotificationContext } from "../../Notification/NotificationContext";
import { useUserContext } from "../../UserContext/UserContext";

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}

interface AddLocationState {
  add: {
    location: {
      name: string;
      code: string;
      parentLocationId?: number;
    };
  };
}

const AddLocation: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext()
  const { warning, success, error } = useNotificationContext();
  const [ locationBase, setLocationBase ] = useState<LocationType[]>([])
  const [ loading, setLoading ] = useState<boolean>(false);

  const [state, setState] = useState<AddLocationState>({
    add: {
      location: {
        name: "",
        code: "",
      },
    },
  });

  useEffect(() => {
    getLocations();
  }, []);

  /* SET */

  const setAddNewLocationStringState = (fieldName: string, newValue: string) => {
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

  /* GET */

  const getLocations = async () => {
    try {
      setLoading(true);
      const res = await api("api/location?sort=name,ASC", "get", {}, role);
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja lokacija.");
        return;
      }
      setLocationBase(res.data);
      setLoading(false);
    } catch (err: any) {
      error.notification(err.data.message);
      setLoading(false);
    }
  };

  const doAddLocation = async () => {
    try {
      setLoading(true);
      const res = await api("api/location/", "post", state.add.location, role);
      if (res.status === "error") {
        warning.notification("Greška prilikom dodavanja lokacije.");
        return;
      }
      success.notification("Uspješno dodana lokacija");
      getLocations();
      setLoading(false);
    } catch (err:any) {
      error.notification(err.data.message);
      setLoading(false);
    }
  };

  const onFinish = () => {
    doAddLocation();
  };

  return (
        <Form
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ name: state.add.location.name, code: state.add.location.code }}
        >
              <Form.Item
                label="Naziv lokacije"
                name="name"
                rules={[{ required: true, message: "Molimo unesite naziv lokacije!" }]}
              >
                <Input
                  value={state.add.location.name}
                  onChange={(e) => setAddNewLocationStringState("name", e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Šifra lokacije"
                name="code"
                rules={[{ required: true, message: "Molimo unesite šifru lokacije!" }]}
              >
                <Input
                  value={state.add.location.code}
                  onChange={(e) => setAddNewLocationStringState("code", e.target.value)}
                />
              </Form.Item>

              <Form.Item label="Glavna lokacija" name="parentLocationId">
                <Select
                  placeholder="Odaberite glavnu lokaciju"
                  onChange={(value) => setAddNewLocationStringState("parentLocationId", value.toString())}
                >
                  {locationBase.map((locData) => (
                    <Select.Option key={locData.locationId} value={locData.locationId}>
                      {`${locData.locationId} - ${locData.name}`}
                    </Select.Option>
                  ))}
                </Select>
                <p className="text-xs mt-2 pl-4">Opciju koristiti u slučaju da lokacija ne postoji, pa se dodaje pod-lokacija</p>
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Dodaj
                </Button>
              </Form.Item>
        </Form>
  );
};

export default AddLocation;
