import { Button, Card, Collapse, CollapseProps, message, Modal, Table, Tag, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocumentsType from "../../../../types/DocumentsType";
import { ApiResponse, useApi } from "../../../../API/api";
import { UserRole } from "../../../../types/UserRoleType";
import { useUserContext } from "../../../UserContext/UserContext";

const UnsignedDocuments = () => {
    const { api } = useApi();
    const { role } = useUserContext();
    const [unsignedDocuments, setUnsignedDocuments] = useState<DocumentsType[]>([]);
    const [unsignedDocumentDataCount, setUnsignedDocumentCount] = useState<number>();
    const [loading, setLoading] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();
    const [selectedUnsignedDocumentId, setSelectedUnsignedDocumentId] = useState<number | null>(null);
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUnsignedDocuments();
    }, []);

    const fetchUnsignedDocuments = async () => {
        setLoading(true);
        try {
            api(`api/document/unsigned`, "get", undefined, role as UserRole).then(async (res: ApiResponse) => {
                if (res.status === "forbidden") {
                    message.error("Korisnik nema dovoljno prava za učitavanje podataka");
                    return;
                }
                if (res.status === "error") {
                    message.error("Greška prilikom učitavanja podataka");
                    navigate("/login");
                    return;
                }
                if (res.status === "login") {
                    message.warning("Vaša prijava je istekla, molimo prijavite se ponovo!");
                    navigate("/login");
                    return;
                }
                const [documents, count] = res.data;
                setUnsignedDocuments(documents);
                setUnsignedDocumentCount(count);
            });
        } catch (error) {
            message.error("Sistemska greška, molim kontaktirajte administratora: " + error);
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file || !selectedUnsignedDocumentId) {
            message.error("Molimo odaberite fajl za upload.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setLoading(true);
            const response = await api(
                `api/document/${selectedUnsignedDocumentId}/upload`,
                "post",
                formData,
                role as UserRole,
                { useMultipartFormData: true }
            );

            if (response.status === "ok") {
                message.success("Fajl uspješno učitan!");
                setUploadModalVisible(false);
                fetchUnsignedDocuments();
            } else {
                message.error("Greška prilikom učitavanja fajla.");
            }
        } catch (error) {
            message.error("Sistemska greška: " + error);
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
            render: (record: DocumentsType) =>
                record.articleTimelines && record.articleTimelines[0].subbmited?.fullname,
        },
        {
            key: "preuzeo",
            title: "Preuzeo",
            render: (record: DocumentsType) =>
                record.articleTimelines && record.articleTimelines[0].user?.fullname,
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

    const listUnsigned = () => {
        return (
            <Table
                loading={loading}
                pagination={{ style: { marginRight: "12px" } }}
                dataSource={unsignedDocuments}
                columns={columns}
                scroll={{ x: "max-content" }}
                size="small"
            />
        );
    };

    return (
        <Card 
        className="rounded-xl">
            {contextHolder}
            <Collapse 
                    className="rounded-xl">
                <Collapse.Panel
                    key="1" 
                    header={
                        <>
                            Nepotpisane prenosnice <Tag color="volcano" >{unsignedDocumentDataCount}</Tag>
                        </>
                    }
                >
                    {listUnsigned()}
                </Collapse.Panel>
            </Collapse>
            <Modal
                title="Upload Fajla"
                open={uploadModalVisible}
                onCancel={() => setUploadModalVisible(false)}
                onOk={handleUpload}
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
