import React, { useEffect, useState } from "react";
import { useApi } from "../../../../API/api";
import { Button, Input, Form, notification } from "antd";
import { useNotificationContext } from "../../../Notification/NotificationContext";
import { useUserContext } from "../../../UserContext/UserContext";

const AddJob: React.FC = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { success, error } = useNotificationContext();

  const [state, setState] = useState<{
    job: {
      title: string;
      description: string;
      jobCode: string;
    };
  }>({
    job: {
      title: "",
      description: "",
      jobCode: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getJobs();
  }, []);

  /* GET */
  const getJobs = async () => {
    try {
      setLoading(true);
      const res = await api("api/job?sort=title,ASC", "get", {}, role);
      if (res.status === "error") {
        notification.error({
          message: "Greška prilikom učitavanja radnih mjesta.",
        });
        setLoading(false);
        return;
      }
      setLoading(false);
    } catch (error) {
      notification.error({
        message: "Greška prilikom učitavanja radnih mjesta.",
      });
      setLoading(false);
    }
  };

  const doAddJob = async () => {
    try {
      setLoading(true);
      const res = await api("api/job/", "post", state.job, role);
      if (res.status === "error") {
        error.notification("Greška prilikom dodavanja radnog mjesta.");
        setLoading(false);
        return;
      }
      success.notification("Uspješno dodano radno mjesto");
      getJobs();
      setLoading(false);
    } catch (err: any) {
      error.notification(err.data.message);
      setLoading(false);
    }
  };

  const addForm = () => (
    <Form
      layout="vertical"
      initialValues={state.job}
      onFinish={doAddJob}
      onFinishFailed={() => notification.warning({ message: "Molimo popunite sva polja" })}
    >
      <Form.Item
        label="Naziv radnog mjesta"
        name="title"
        rules={[{ required: true, message: "Naziv radnog mjesta je obavezan" }]}
      >
        <Input
          value={state.job.title}
          onChange={(e) => setState({ ...state, job: { ...state.job, title: e.target.value } })}
        />
      </Form.Item>

      <Form.Item
        label="Opis"
        name="description"
        rules={[{ required: true, message: "Opis je obavezan" }]}
      >
        <Input.TextArea
          value={state.job.description}
          onChange={(e) => setState({ ...state, job: { ...state.job, description: e.target.value } })}
          rows={4}
        />
      </Form.Item>

      <Form.Item
        label="Šifra radnog mjesta"
        name="jobCode"
        rules={[{ required: true, message: "Šifra radnog mjesta je obavezna" }]}
      >
        <Input
          value={state.job.jobCode}
          onChange={(e) => setState({ ...state, job: { ...state.job, jobCode: e.target.value } })}
        />
      </Form.Item>

      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        disabled={!state.job.title}
      >
        Dodaj radno mjesto
      </Button>
    </Form>
  );

  return (
    <div>
      {addForm()}
    </div>
  );
};

export default AddJob;
