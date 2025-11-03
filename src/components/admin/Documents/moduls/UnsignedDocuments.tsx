import { Button, Card, Collapse, Modal, Table, Tag, Upload } from "antd";
import { ExclamationCircleOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentsType from "../../../../types/DocumentsType";
import { ApiResponse, useApi } from "../../../../API/api";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";

const { confirm } = Modal;

const UnsignedDocuments = () => {
  const { api } = useApi();
  const { role } = useUserContext();
  const { error, warning, success } = useNotificationContext();
  const [unsignedDocuments, setUnsignedDocuments] = useState<DocumentsType[]>([]);
  const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [selectedUnsignedDocumentId, setSelectedUnsignedDocumentId] = useState<number | null>(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();
  const [size, setSize] = useState<{ padding: number }>({ padding: 24 });

  useEffect(() => {
    fetchUnsignedDocuments();
  }, []);

  const fetchUnsignedDocuments = async () => {
    setLoading(true);
    try {
      const res: ApiResponse = await api(`api/document/unsigned`, "get", undefined, role as UserRole);
      if (res.status === "forbidden") {
        warning.notification("Korisnik nema dovoljno prava za učitavanje podataka");
        return;
      }
      if (res.status === "error") {
        error.notification("Greška prilikom učitavanja podataka");
        navigate("/login");
        return;
      }
      if (res.status === "login") {
        warning.notification("Vaša prijava je istekla, molimo prijavite se ponovo!");
        navigate("/login");
        return;
      }
      const [documents, count] = res.data;
      setUnsignedDocuments(documents);
      setUnsignedDocumentCount(count);
    } catch (err: any) {
      error.notification(err.data?.message || "Greška prilikom učitavanja podataka");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      setSize(window.innerWidth <= 768 ? { padding: 0 } : { padding: 24 });
    };
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleUpload = async (addWithoutFile?: boolean) => {
    if (!file && !addWithoutFile) {
      warning.notification("Molimo odaberite fajl za upload ili koristite opciju bez fajla.");
      return;
    }
    if (!selectedUnsignedDocumentId) return;

    try {
      setLoading(true);

      if (addWithoutFile) {
        const response = await api(
          `api/document/${selectedUnsignedDocumentId}/upload`,
          "post",
          { pathOverride: "2023/potpisano/prenosnica-1.pdf" },
          role as UserRole
        );

        if (response.status === "ok") {
          success.notification("Dokument uspješno dodan bez fajla!");
          fetchUnsignedDocuments();
        } else {
          error.notification("Greška prilikom dodavanja dokumenta.");
        }
      } else if (file) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api(
          `api/document/${selectedUnsignedDocumentId}/upload`,
          "post",
          formData,
          role as UserRole,
          { useMultipartFormData: true }
        );

        if (response.status === "ok") {
          success.notification("Fajl uspješno učitan!");
          setFile(null);
          fetchUnsignedDocuments();
        } else {
          error.notification("Greška prilikom učitavanja fajla.");
        }
      }
    } catch (err: any) {
      error.notification(err.data?.message || "Greška prilikom učitavanja.");
    } finally {
      setLoading(false);
      setUploadModalVisible(false);
    }
  };

  const showConfirmWithoutFile = () => {
    confirm({
      title: "Dodaj dokument bez fajla?",
      icon: <ExclamationCircleOutlined />,
      content: "Ova opcija će dodati dokument sa fiksnim PDF path-om.",
      okText: "Da, dodaj",
      okType: "danger",
      cancelText: "Otkaži",
      onOk() {
        handleUpload(true);
      },
    });
  };

  const columns = [
    { key: "documentNumber", dataIndex: "documentNumber", title: "#" },
    {
      key: "naziv-artikla",
      dataIndex: "",
      title: "Naziv",
      render: (record: DocumentsType) => record.article?.stock?.name,
    },
    {
      key: "inventurni-broj",
      dataIndex: "",
      title: "Inv.Broj",
      render: (record: DocumentsType) => record.article?.invNumber,
    },
    {
      key: "predao",
      title: "Predao",
      render: (record: DocumentsType) => record.articleTimelines && record.articleTimelines[0].subbmited?.fullname,
    },
    {
      key: "preuzeo",
      title: "Preuzeo",
      render: (record: DocumentsType) => record.articleTimelines && record.articleTimelines[0].user?.fullname,
    },
    {
      key: "documentsId",
      dataIndex: "documentsId",
      title: "Upload",
      render: (documentsId: number) => (
        <div className="flex gap-2">
          <Button
            icon={<UploadOutlined />}
            type="primary"
            onClick={() => {
              setSelectedUnsignedDocumentId(documentsId);
              setUploadModalVisible(true);
            }}
          >
            Dodaj fajl
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              setSelectedUnsignedDocumentId(documentsId);
              showConfirmWithoutFile();
            }}
          >
            Dodaj bez fajla
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="rounded-xl" bodyStyle={size}>
      <Collapse className="rounded-xl">
        <Collapse.Panel
          key="1"
          header={
            <>
              Nepotpisane prenosnice <Tag color="volcano">{unsignedDocumentDataCount}</Tag>
            </>
          }
        >
          <Table
            loading={loading}
            dataSource={unsignedDocuments}
            columns={columns}
            scroll={{ x: "max-content" }}
            size="small"
          />
        </Collapse.Panel>
      </Collapse>

      <Modal
        title="Upload Fajla"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setFile(null);
        }}
        onOk={() => handleUpload()}
        confirmLoading={loading}
      >
        <Upload
          beforeUpload={(file) => {
            setFile(file);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Odaberite fajl</Button>
        </Upload>
      </Modal>
    </Card>
  );
};

export default UnsignedDocuments;
