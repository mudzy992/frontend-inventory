import React, { useEffect, useState } from "react";
import { useApi } from "../../../API/api";
import CategoryType from "../../../types/CategoryType";
import { Button, Card, Form, Input, Select, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useNotificationContext } from "../../Contexts/Notification/NotificationContext";

const { Option } = Select;

interface AddCategoryPageState {
  categories: CategoryType[];
  addNewCategory: {
    name: string;
    parentCategoryId: number | null;
    imagePath: string;
  };
}

const AddNewCategoryPage: React.FC = () => {
  const { api } = useApi();
  const {warning, error, success} = useNotificationContext()
  const [state, setState] = useState<AddCategoryPageState>({
    categories: [],
    addNewCategory: {
      name: "",
      imagePath: "",
      parentCategoryId: null,
    },
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      setLoading(true);
      const res = await api("api/category/", "get", {}, "administrator");
      if (res.status === "login") {
        navigate("/login/");
        return;
      }
      if (res.status === "error") {
        warning.notification("Greška prilikom učitavanja kategorija, pokušajte ponovo.");
        return;
      }
      setState((prev) => ({ ...prev, categories: res.data }));
    } catch (err:any) {
      error.notification(err.data.message);
    } finally {
      setLoading(false);
    }
  };

  const doAddCategory = async () => {
    try {
      const res = await api("api/category/", "post", state.addNewCategory, "administrator");
      if (res.status === "login") {
        navigate("/login/");
        return;
      }
      if (res.status === "error") {
        warning.notification("Greška prilikom dodavanja kategorije, pokušajte ponovo.");
        return;
      }
      success.notification("Kategorija je uspješno dodana.");
    } catch (err:any) {
      error.notification(err.data.message);
    }
  };

  return (
    <div>
          <Card loading={loading} title="Dodavanje nove kategorije">
            <Form
              layout="vertical"
              onFinish={doAddCategory}
              initialValues={state.addNewCategory}
            >
              <Form.Item
                label="Nova kategorija (naziv)"
                name="name"
                rules={[{ required: true, message: "Unesite naziv kategorije." }]}
              >
                <Input
                  placeholder="Unesite naziv kategorije"
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      addNewCategory: { ...prev.addNewCategory, name: e.target.value },
                    }))
                  }
                />
              </Form.Item>

              <Form.Item label="Ikona kategorije" name="imagePath" >
                <Input
                  placeholder="Unesite putanju ikone"
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      addNewCategory: { ...prev.addNewCategory, imagePath: e.target.value },
                    }))
                  }
                />
                
              </Form.Item>
              <p className="pl-3 text-sm text-default-500">
                    Ikonu kategorije pronaći{" "}
                    <a
                      href="https://icons.getbootstrap.com/"
                      target={"_blank"}
                      rel={"noreferrer"}
                    >
                      ovjde
                    </a>{" "}
                    te kopirati class. Primjer{" "}
                    <i style={{ color: "red" }}>"bi bi-align-center"</i>
                  </p>
              <Form.Item label="Podkategorija" name="parentCategoryId">
                <Select
                  placeholder="Odaberite podkategoriju"
                  onChange={(value) =>
                    setState((prev) => ({
                      ...prev,
                      addNewCategory: { ...prev.addNewCategory, parentCategoryId: value },
                    }))
                  }
                >
                  {state.categories.map((category) => (
                    <Option key={category.categoryId} value={category.categoryId}>
                      {category.categoryId} - {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Dodaj kategoriju
                </Button>
              </Form.Item>
            </Form>
          </Card>
      </div>
  );
};

export default AddNewCategoryPage;
