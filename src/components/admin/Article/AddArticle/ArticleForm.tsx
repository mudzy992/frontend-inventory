import React, { useEffect, useState } from "react";
import { Button, Card, Checkbox, Form, Input, Select, Spin, Tooltip } from "antd";
import CategoryType from "../../../../types/CategoryType";
import { ApiResponse, useApi } from "../../../../API/api";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";

interface ArticleFormProps {
  initialData: any;
  onSubmit: (data: any) => void;
  loading: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSubmit, loading }) => {
  const { api } = useApi();
  const { role } = useUserContext();
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [cateogryID, setCategoryID] = useState<number | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    getCategories();
    if (initialData) {
      initializeFeatures(initialData.categoryId);
    }
  }, [initialData]);

  const getCategories = async () => {
    try {
      const res: ApiResponse = await api("api/category", "get", {}, role);
      if (res.status === "ok") {
        const filteredCategories = res.data.filter((category: any) => category.parentCategoryId !== null);
        setCategories(filteredCategories);
      }
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };


  const getFeaturesByCatId = async (categoryId: number) => {
    const res: ApiResponse = await api(`api/feature/cat/${categoryId}/`, "get", {}, "administrator");
    if (res.status === "ok") {
      return res.data.map((item: any) => ({
        featureId: item.featureId,
        name: item.name,
        value: "",
        use: false,
      }));
    }
    return [];
  };

  const initializeFeatures = async (categoryId: number) => {
    const fetchedFeatures = await getFeaturesByCatId(categoryId);
    let mergedFeatures = fetchedFeatures.map((feature:any) => {
      const existingFeature = initialData?.stockFeatures?.find((f: any) => f.featureId === feature.featureId);
      return existingFeature
        ? { ...feature, value: existingFeature.value, use: !!existingFeature.value }
        : feature;
    });
    setCategoryID(initialData.categoryId);
    form.setFieldsValue({ features: mergedFeatures });
  };

  const handleCategoryChange = async (categoryId: number) => {
    if (!categoryId) return;
    setCategoryID(categoryId);
    initializeFeatures(categoryId);
  };

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Form form={form} initialValues={initialData} onFinish={handleFinish} layout="vertical" className="flex flex-col gap-3">
      <Card title="Detalji opreme">
        <Form.Item name="name" label="Naziv opreme" rules={[{ required: true, message: "Naziv opreme je obavezan" }]}>
          <Input />
        </Form.Item>
        <Form.Item name="categoryId" label="Kategorija" rules={[{ required: true, message: "Kategorija je obavezna" }]}>
          <Select onChange={handleCategoryChange}>
            {categories.map((category) => (
              <Select.Option key={category.categoryId} value={category.categoryId}>
                {category.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="excerpt" label="Kratki opis">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="description" label="Detaljan opis">
          <Input.TextArea />
        </Form.Item>
        <Form.Item name="sapNumber" label="SAP broj">
          <Input />
        </Form.Item>
        <Form.Item name="comment" label="Komentar">
          <Input.TextArea />
        </Form.Item>
      </Card>
      <Card title="Osobine skladišta">
        <Form.Item name="contract" label="Broj ugovora">
          <Input />
        </Form.Item>
        <Form.Item name="valueOnContract" label="Stanje po ugovoru">
          <Input type="number" />
        </Form.Item>
        <Form.Item name="valueAvailable" label="Dostupno stanje">
          <Input type="number" />
        </Form.Item>
      </Card>
      {cateogryID &&
      <Card title="Detalji opreme">
        <Form.List name="features">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, fieldKey, ...restField }) => (
                <div key={key} className="flex items-center gap-3 w-full max-w-full">
                  <Form.Item {...restField} name={[name, "use"]} valuePropName="checked">
                    <Checkbox className="mt-7" />
                  </Form.Item>
                  <Tooltip title="U slučaju da se ne označi kvadratić pored, osobina neće biti prikazana">
                    <Form.Item {...restField} name={[name, "value"]} label={form.getFieldValue(["features", name, "name"])} className="w-full max-w-full">
                      <Input className="w-full max-w-full"/>
                    </Form.Item>
                  </Tooltip>
                </div>
              ))}
            </>
          )}
        </Form.List>
      </Card>}
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialData ? "Izmijeni opremu" : "Dodaj opremu"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ArticleForm;
