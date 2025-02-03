import React, { useState, useEffect } from "react";
import { Form, Input, Button, Modal, Checkbox } from "antd";
import { ApiResponse, useApi } from "../../../../API/api";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";

interface AdditionSettingsModalProps {
  data: any;
  visible: boolean;
  onClose: () => void;
  refreshData: () => void;
}

const AdditionSettingsModal: React.FC<AdditionSettingsModalProps> = ({
  data,
  visible,
  onClose,
  refreshData,
}) => {
  const [form] = Form.useForm();
  const { api } = useApi();
  const [tempFeatures, setTempFeatures] = useState<any[]>([]); 
  const { role } = useUserContext();
  const { error, warning, success } = useNotificationContext();

  useEffect(() => {
    if (data) {
      putArticleDetailsInState(data);
    }
  }, [data]);

  useEffect(() => {
    if (tempFeatures.length > 0) {
      form.setFieldsValue({
        articleFeatures: tempFeatures.map((feature: any) => ({
          articleId: data.articleId,
          featureId: feature.featureId,
          featureValue: feature.featureValue,
          use: feature.use === 1,
        })),
      });
    }
  }, [tempFeatures, form]);

  const putArticleDetailsInState = async (article: any) => {
    try {
      const features = await getFeaturesByCategoryId(article.category?.categoryId!);

      const articleFeatures = (article.articleFeatures || []).map((feature: any) => ({
        ...feature,
        use: feature.featureValue ? 1 : 0,
      }));

      features.forEach((feature: any) => {
        const existingFeature = articleFeatures.find((f: any) => f.featureId === feature.featureId);
        if (!existingFeature) {
          articleFeatures.push({
            featureId: feature.featureId,
            featureValue: "",
            use: 0,
            articleId: article.articleId,
            feature: { name: feature.name, featureId: feature.featureId },
          });
        }
      });
      setTempFeatures(articleFeatures);
    } catch (error) {
      console.error("Greška pri postavljanju detalja o artiklu", error);
    }
  };

  const getFeaturesByCategoryId = async (categoryId: number): Promise<any[]> => {
    try {
      const res = await api(`/api/feature/cat/${categoryId}`, "get", "administrator");
      const features: any[] = res.data.map((item: any) => ({
        featureId: item.featureId,
        name: item.name,
        value: item.articleFeatures.length > 0 ? item.articleFeatures[0].featureValue : "",
        articleFeatureId: item.articleFeatures.length > 0 ? item.articleFeatures[0].articleFeatureId : null,
      }));

      return features;
    } catch (error) {
      throw new Error(`Greška pri dohvatanju osobina po kategoriji: ${error}`);
    }
  };

  const handleFinish = async () => {
    const dataToSend = {
      features: tempFeatures
        .filter((feature: any) => feature.use === 1)
        .map((feature: any) => ({
          articleId: data.articleId,
          featureId: feature.featureId,
          featureValue: feature.featureValue,
        })),
    };
 
    const featuresToDelete = tempFeatures
      .filter((feature: any) => feature.use === 0 && feature.articleFeatureId)
      .map((feature: any) => feature.articleFeatureId);
  
    const deleteDataToSend = { articleFeatureIds: featuresToDelete };
 
    const sendApiRequest = async (url: string, method: "put" | 'delete', data: any) => {
      try {
        const res = await api(url, method, data, role);
        if (res.status === "ok") {
          success.notification("Izmjena na dodatnoj specifikaciji uspješno izvršena");
        } else if (res.status === "forbidden") {
          warning.notification("Nemate prava za ovu akciju");
        } else if (res.status === "error") {
          error.notification("Greška prilikom izmjene na dodatnoj specifikaciji!");
        }

        onClose()
        refreshData()
      } catch (err: any) {
        error.notification("Greška prilikom izmjene na dodatnoj specifikaciji!");
      }
    };

    if (dataToSend.features.length > 0) {
      await sendApiRequest('api/article-features', "put", dataToSend);
    }
  
    if (featuresToDelete.length > 0) {
      await sendApiRequest('api/article-features', "delete", deleteDataToSend);
    }
  };
  

  return (
    <Modal
      title="Dodatne specifikacije"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        {tempFeatures.map((feature, index) => (
          <div key={feature.featureId} className="flex flex-row gap-2 items-center">
            <Form.Item
              name={['articleFeatures', index, 'use']}
              valuePropName="checked"
              initialValue={feature.use === 1}
              className="mt-8"
            >
              <Checkbox
                checked={feature.use === 1} 
                onChange={(e) => {
                  const newTempFeatures = [...tempFeatures];
                  newTempFeatures[index].use = e.target.checked ? 1 : 0; 
                  setTempFeatures(newTempFeatures); 
                }}
              />
            </Form.Item>
            <Form.Item
              name={['articleFeatures', index, 'featureValue']}
              label={feature.feature.name}
              initialValue={feature.featureValue}
              className="w-full"
            >
              <Input
                value={feature.featureValue}
                placeholder="Unesite vrednost"
                onChange={(e) => {
                  const newTempFeatures = [...tempFeatures];
                  newTempFeatures[index].featureValue = e.target.value;
                  setTempFeatures(newTempFeatures); 
                }}
              />
            </Form.Item>

            

            <Form.Item
              name={['articleFeatures', index, 'featureId']}
              initialValue={feature.featureId}
              hidden
            >
              <Input />
            </Form.Item>
          </div>
        ))}

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Sačuvaj
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AdditionSettingsModal;
