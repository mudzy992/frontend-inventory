import React, { useEffect, useState } from "react";
import { useApi } from "../../../../API/api";
import { Button, Input, Form, Select, Spin } from "antd";
import { useNotificationContext } from "../../../Notification/NotificationContext";
import { useUserContext } from "../../../UserContext/UserContext";

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}

interface AddLocationState { 
  name: string;
  code: string;
  parentLocationId?: number;
}

const AddLocation: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { warning, success, error } = useNotificationContext();

  const [locationBase, setLocationBase] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm();

  const [state, setState] = useState<AddLocationState>({
    name: "",
    code: "",
  });

  useEffect(() => {
    const fetchLocations = async () => {
      setLoading(true);
      try {
        const res = await api("api/location?sort=name,ASC", "get", {}, role);
        if (res.status === "error") {
          warning.notification("Greška prilikom učitavanja lokacija.");
          return;
        }
        setLocationBase(res.data);
      } catch (err: any) {
        error.notification(err.data.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [ role, warning, error]);

  // Funkcija za dodavanje nove lokacije
  const doAddLocation = async () => {
    setLoading(true);
    try {
      const res = await api("api/location/", "post", state, role);
      if (res.status === "error") {
        warning.notification("Greška prilikom dodavanja lokacije.");
        return;
      }
      success.notification("Uspješno dodana lokacija");
      setState({ name: "", code: "" }); // Resetovanje forme
      setLocationBase(prevState => [...prevState, res.data]); // Dodavanje nove lokacije u listu
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinish = () => {
    doAddLocation();
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ name: state.name, code: state.code }}
    >
      <Form.Item
        label="Naziv lokacije"
        name="name"
        rules={[{ required: true, message: "Molimo unesite naziv lokacije!" }]}
      >
        <Input
          value={state.name}
          onChange={(e) => setState((prev) => ({ ...prev, name: e.target.value }))}
        />
      </Form.Item>

      <Form.Item
        label="Šifra lokacije"
        name="code"
        rules={[{ required: true, message: "Molimo unesite šifru lokacije!" }]}
      >
        <Input
          value={state.code}
          onChange={(e) => setState((prev) => ({ ...prev, code: e.target.value }))}
        />
      </Form.Item>

      <Form.Item label="Glavna lokacija" name="parentLocationId">
        <Select
          placeholder="Odaberite glavnu lokaciju"
          onChange={(value) => setState((prev) => ({ ...prev, parentLocationId: value }))}
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
        <Button type="primary" htmlType="submit" loading={loading} disabled={!form.isFieldsTouched(true) || form.getFieldsError().filter(({ errors }) => errors.length).length > 0}>
          Dodaj lokaciju
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddLocation;
