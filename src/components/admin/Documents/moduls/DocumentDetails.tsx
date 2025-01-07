import { Button, Descriptions } from "antd";
import { FC, useEffect, useState } from "react";
import DocumentsType from "../../../../types/DocumentsType";
import saveAs from "file-saver";
import { ApiConfig } from "../../../../config/api.config";
import { FileWordOutlined, FilePdfOutlined } from '@ant-design/icons';

interface TabelaProps {
    documentId: number;
    documents: DocumentsType[];
  }

const DocumentsDetails: FC<TabelaProps> = ({documentId, documents}) => {
    const [documentData, setDocumentData] = useState<DocumentsType>()
    const [size, setSize] = useState<'default' | 'small'>('default')

    useEffect(() => {
        getDocumentById()
    }, [])

    useEffect(() => {
        const updateSize = () => {
          setSize(window.innerWidth <= 768 ? 'small' : 'default');
        };
    
        window.addEventListener('resize', updateSize);
        updateSize();
    
        return () => window.removeEventListener('resize', updateSize);
      }, []);
    
    const getDocumentById = () => {
        let document = documents.find((item) => item.documentsId === documentId);
        setDocumentData(document)
        console.log(document)
    };

    const saveFile = (path: string) => {
        saveAs(ApiConfig.TEMPLATE_PATH + path, path);
      };
    
    return (
        <div className="flex flex-col gap-3">
            <div>
                <Descriptions column={1} size={size} bordered title='Podaci o artiklu'>
                    <Descriptions.Item label="Naziv">{documentData?.article?.stock?.name}</Descriptions.Item>
                    <Descriptions.Item label="Serijski broj">{documentData?.article?.serialNumber}</Descriptions.Item>
                    <Descriptions.Item label="Inventurni broj">{documentData?.article?.invNumber}</Descriptions.Item>
                    <Descriptions.Item label="Status">{documentData?.article?.status}</Descriptions.Item>
                </Descriptions>
            </div>
            <div>
                <Descriptions column={1} size={size} bordered title="Infomacije o korisnicima">
                    <Descriptions.Item label="Predao">{documentData?.articleTimelines![0].subbmited?.fullname}</Descriptions.Item>
                    <Descriptions.Item label="Preuzeo">{documentData?.articleTimelines![0].user?.fullname}</Descriptions.Item>
                </Descriptions>
            </div>
            <div>
            <Descriptions column={1} size="middle" bordered title="Linkovi" >
                <Descriptions.Item label={<FileWordOutlined  className="text-primary text-2xl flex justify-center"/>}>
                    {documentData?.path ? (
                    <Button
                        variant="link"
                        color="default"
                        onClick={() => saveFile(documentData?.path!)}
                    >
                        {documentData?.path}
                    </Button>
                    ) : (
                    <span className="text-red-500">RAW dokument nije dostupan</span>
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={<FilePdfOutlined  className="text-danger text-2xl flex justify-center"/>}>
                    {documentData?.signed_path ? (
                    <Button
                        variant="link"
                        color="default"
                        onClick={() => saveFile(documentData?.signed_path!)}
                    >
                        {documentData?.signed_path}
                    </Button>
                    ) : (
                    <span className="text-red-500">PDF dokument nije dostupan</span>
                    )}
                </Descriptions.Item>
                </Descriptions>
            </div>
        </div>
    );
};

export default DocumentsDetails;
