import React, { useEffect, useState } from "react";
import { Select, Card, Input, Button, List, Form, notification } from "antd";
import { ApiResponse, useApi } from "../../../API/api";
import { useNotificationContext } from "../../Notification/NotificationContext";
import { useUserContext } from "../../UserContext/UserContext";

const { Option } = Select;

interface AddFeatureState {
  addNewFeature: {
    name: string;
    categoryId: number;
    features: {
      featureId: number;
      name: string;
      categoryId: number;
    }[];
  };
}

interface FeatureBaseType {
  featureId: number;
  name: string;
  categoryId: number;
}

const AddFeaturePage: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { error, success, warning } = useNotificationContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [state, setState] = useState<AddFeatureState>({
    addNewFeature: {
      name: "",
      categoryId: 0,
      features: [],
    },
  });

  const setAddNewFeatureStringState = (fieldName: string, newValue: string) => {
    setState((prev) => ({
      ...prev,
      addNewFeature: { ...prev.addNewFeature, [fieldName]: newValue },
    }));
  };

  const setAddNewFeatureNumberState = (fieldName: string, newValue: any) => {
    setState((prev) => ({
      ...prev,
      addNewFeature: {
        ...prev.addNewFeature,
        [fieldName]: newValue === "null" ? null : Number(newValue),
      },
    }));
  };

  const getCategories = async () => {
    setLoading(true);
    try {
      const res: ApiResponse = await api(
        "api/category/?filter=parentCategoryId||$notnull",
        "get",
        {},
        role
      );
      if (res.status === "error") {
        warning.notification("Greška prilikom dohvaćanja glavnih kategorija!");
        return;
      }
      const filteredData = res.data.filter((category:any) => category.parentCategoryId !== null)
      setCategories(filteredData);
    } catch (err) {
      error.notification("Došlo je do greške prilikom dohvaćanja podataka.");
    } finally {
      setLoading(false);
    }
  };

  const getFeaturesByCatId = async (categoryId: number): Promise<FeatureBaseType[]> => {
    setLoading(true);
    try {
      const res: ApiResponse = await api(
        `api/feature/cat/${categoryId}/`,
        "get",
        {},
        role
      );
      if (res.status === "error") {
        warning.notification(
          "Greška prilikom učitavanja detalja. Osvježite ili pokušajte ponovo kasnije."
        );
        return [];
      }
      return res.data.map((item: any) => ({
        featureId: item.featureId,
        name: item.name,
        categoryId: categoryId,
      }));
    } catch (err) {
      error.notification("Došlo je do greške prilikom dohvaćanja podataka.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addFeatureCategoryChanged = async (categoryId: number) => {
    setAddNewFeatureNumberState("categoryId", categoryId);
    const features = await getFeaturesByCatId(categoryId);
    setState((prev) => ({
      ...prev,
      addNewFeature: {
        ...prev.addNewFeature,
        categoryId: categoryId,
        features,
      },
    }));
  };

  const doAddFeature = async () => {
    setLoading(true);
    try {
      const res: ApiResponse = await api(
        "/api/feature/",
        "post",
        {
          categoryId: state.addNewFeature.categoryId,
          name: state.addNewFeature.name,
        },
        role
      );
      if (res.status === "error") {
        error.notification(
          "Greška prilikom dodavanja nove osobine. Provjerite da li se osobina već nalazi u listi iznad. Osvježite ili pokušajte ponovo kasnije."
        );
        return;
      }
      const features = await getFeaturesByCatId(state.addNewFeature.categoryId);
      setState((prev) => ({
        ...prev,
        addNewFeature: {
          ...prev.addNewFeature,
          features,
        },
      }));
      success.notification("Dodavanje uspješno završeno.");
    } catch (err) {
      error.notification("Došlo je do greške prilikom dodavanja nove osobine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <Card loading={loading} title="Dodaj osobinu">
      <Form layout="vertical">
        <Form.Item label="Kategorija">
          <Select
            placeholder="Odaberite kategoriju"
            onChange={addFeatureCategoryChanged}
            style={{ width: "100%" }}
          >
            {categories.map((category) => (
              <Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {state.addNewFeature.features.length > 0 && (
          <Form.Item label="Trenutne osobine">
            <List
              bordered
              dataSource={state.addNewFeature.features}
              renderItem={(item) => <List.Item>{item.name}</List.Item>}
              style={{ marginBottom: "1rem" }}
            />
          </Form.Item>
        )}

        <Form.Item label="Nova osobina">
          <Input
            placeholder="Unesite naziv osobine"
            value={state.addNewFeature.name}
            onChange={(e) => setAddNewFeatureStringState("name", e.target.value)}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            onClick={doAddFeature}
            loading={loading}
            disabled={!state.addNewFeature.name}
          >
            Dodaj osobinu
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default AddFeaturePage;
