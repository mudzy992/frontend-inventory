import React, { useState } from "react";
import { Button, Input, Form, Select } from "antd";
import { useApi } from "../../../../API/api";
import { useNotificationContext } from "../../../Notification/NotificationContext";
import { useUserContext } from "../../../UserContext/UserContext";

interface LocationType {
  locationId: number;
  name: string;
  code: string;
  parentLocationId: number;
}

const AddLocation: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const [form] = Form.useForm();
  const { warning, success, error, info } = useNotificationContext();
  const [locationBase, setLocationBase] = useState<LocationType[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<LocationType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectLoading, setSelectLoading] = useState<boolean>(false);

  const fetchLocations = async () => {
    setSelectLoading(true);
    try {
      const res = await api("api/location?sort=name,ASC", "get", {}, role);
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja lokacija.");
        return;
      }
      setLocationBase(res.data);
      setFilteredLocations(res.data);
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setSelectLoading(false);
    }
  };

  const doAddLocation = async () => {
    setLoading(true);
    try {
      const values = form.getFieldsValue();
      const res = await api("api/location/", "post", values, role);
      if (res.status === "error") {
        warning.notification("Greška prilikom dodavanja lokacije.");
        return;
      }
      success.notification("Uspješno dodana lokacija");
      form.resetFields();
    } catch (err: any) {
      error.notification(err.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    if (!value) {
      setFilteredLocations(locationBase);
    } else {
      const filtered = locationBase.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredLocations(filtered);
    }
  };

  const handleClear = () => {
    setFilteredLocations(locationBase);
  };

  const handleDropdownVisibleChange = (open: boolean) => {
    if (open && locationBase.length === 0) {
      fetchLocations();
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={doAddLocation}
      onFinishFailed={() =>
        info.notification("Polja sa oznakom * su obavezna")
      }
    >
      <Form.Item
        label="Naziv lokacije"
        name="name"
        rules={[{ required: true, message: "Molimo unesite naziv lokacije!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Šifra lokacije"
        name="code"
        rules={[{ required: true, message: "Molimo unesite šifru lokacije!" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item 
        label="Glavna lokacija" 
        name="parentLocationId"
        >
        <Select
          placeholder="Odaberite glavnu lokaciju"
          loading={selectLoading}
          showSearch
          onSearch={handleSearch}
          onDropdownVisibleChange={handleDropdownVisibleChange}
          filterOption={false}
          allowClear
          onClear={handleClear}
          onChange={(value) => {
            form.setFieldsValue({ parentLocationId: value });
          }}
        >
          {filteredLocations.map((locData) => (
            <Select.Option key={locData.locationId} value={locData.locationId}>
              {`${locData.locationId} - ${locData.name}`}
            </Select.Option>
          ))}
        </Select>
        <p className="text-xs mt-2 pl-4">
          Opciju koristiti u slučaju da lokacija ne postoji, pa se dodaje pod-lokacija
        </p>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
        >
          Dodaj lokaciju
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddLocation;
