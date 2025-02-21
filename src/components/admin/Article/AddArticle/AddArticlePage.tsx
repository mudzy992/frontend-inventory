import React, { useState } from "react";
import { Spin } from "antd";
import { ApiResponse, useApi } from "../../../../API/api";
import ArticleForm from "./ArticleForm";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";

const AddArticlePage: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { success, error, warning } = useNotificationContext();
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddArticle = async (data: any) => {
    setLoading(true);
    const requestBody = {
      ...data,
      valueAvailable: Number(data.valueAvailable),
      valueOnContract: Number(data.valueOnContract),
      features: data.features.filter((feature: any) => feature.use === true).map((feature: any) => ({
        featureId: feature.featureId,
        value: feature.value,
      })),
    };

    try {
      const res: ApiResponse = await api("/api/stock/", "post", requestBody, role);
      if (res.status === "ok") {
        success.notification("Artikal je uspješno dodan");
      }
    } catch (err: any) {
      warning.notification("Greška prilikom dodavanja artikla");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-3 h-max lg:px-4">
      {loading ? (
        <div className="flex h-screen items-center justify-center">
          <Spin tip="Učitavanje..." />
        </div>
      ) : (
        <ArticleForm initialData={null} onSubmit={handleAddArticle} loading={loading} />
      )}
    </div>
  );
};

export default AddArticlePage;
