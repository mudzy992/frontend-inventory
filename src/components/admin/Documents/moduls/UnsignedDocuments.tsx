import { Alert, Button, Card, Checkbox, Collapse, Modal, Table, Tag, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentsType from "../../../../types/DocumentsType";
import { ApiResponse, useApi } from "../../../../API/api";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../Contexts/UserContext/UserContext";
import { useNotificationContext } from "../../../Contexts/Notification/NotificationContext";

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
  const [addWithoutFile, setAddWithoutFile] = useState(false);
  const navigate = useNavigate();
  const [size, setSize] = useState<{ padding: number }>({ padding: 24 });

  useEffect(() => {
    fetchUnsignedDocuments();
  }, []);

  const fetchUnsignedDocuments = async () => {
    setLoading(true);
    try {
      api(`api/document/unsigned`, "get", undefined, role as UserRole).then(async (res: ApiResponse) => {
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
      });
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

  const handleUpload = async () => {
    if (!file && !addWithoutFile) {
      warning.notification("Molimo odaberite fajl za upload ili označite opciju bez fajla.");
      return;
    }
    if (!selectedUnsignedDocumentId) return;

    try {
      setLoading(true);

      if (addWithoutFile) {
        // Poziv backend-a sa fiksnim path-om
        const response = await api(
          `api/document/${selectedUnsignedDocumentId}/upload`,
          "post",
          { pathOverride: "2023/potpisano/prenosnica-1.pdf" },
          role as UserRole
        );

        if (response.status === "ok") {
          success.notification("Dokument uspješno dodan bez fajla!");
          setUploadModalVisible(false);
          setAddWithoutFile(false);
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
          setUploadModalVisible(false);
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
    }
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
        <Button
          icon={<UploadOutlined />}
          onClick={() => {
            setSelectedUnsignedDocumentId(documentsId);
            setUploadModalVisible(true);
          }}
        >
          Dodaj fajl
        </Button>
      ),
    },
  ];

  const listUnsigned = () => (
    <Table
      loading={loading}
      dataSource={unsignedDocuments}
      columns={columns}
      scroll={{ x: "max-content" }}
      size="small"
    />
  );

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
          {listUnsigned()}
        </Collapse.Panel>
      </Collapse>

      <Modal
        title="Dodavanje skenirane prenosnice"
        open={uploadModalVisible}
        onCancel={() => {
          setUploadModalVisible(false);
          setFile(null);
          setAddWithoutFile(false);
        }}
        cancelText="Izađi"
        onOk={handleUpload}
        okText="Snimi izmjene"
        confirmLoading={loading}
      >
        <div className="flex flex-col gap-3">
        <Alert description={
            <div className="flex flex-col gap-2">
            <span>Ako želite dodati dokument bez fajla, označite opciju ispod.</span>
            <Checkbox
            type="checkbox"
            checked={addWithoutFile}
            onChange={(e) => setAddWithoutFile(e.target.checked)}
            id="without-file"
            >Dodaj dokument bez fajla</Checkbox>
        </div>
        } type="error" showIcon />

        {!addWithoutFile && (
          <Upload
            beforeUpload={(file) => {
              setFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Odaberite fajl</Button>
          </Upload>
        )}
        </div>
      </Modal>
    </Card>
  );
};

export default UnsignedDocuments;
