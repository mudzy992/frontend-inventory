import { FC, useEffect, useState } from "react";
import api from "../../../API/api";
import "./styleArticleTimeline.css";
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";

interface ArticleTimelineProps {
  show: boolean;
  onHide: () => void;
  articleTimlineId: number;
}

interface ArticleTimlineType {
  serialNumber: number;
  status: string;
  timestamp: string;
  invNumber: string;
  comment: string;
  article: {
    stock: {
      name: string;
      valueOnContract: number;
      valueAvailable: number;
    };
  };
  user: {
    fullname: string;
    gender: string;
  };
  subbmited: {
    fullname: string;
    gender: string;
  };
}

const ArticleTimlineModal: FC<ArticleTimelineProps> = ({
  show,
  onHide,
  articleTimlineId,
}) => {
  const [articleTimelineData, setArticleTimelineData] =
    useState<ArticleTimlineType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [message, setMessage] = useState<string>();
  useEffect(() => {
    if (show) {
      setIsLoading(true);
      api("api/articleTimeline/" + articleTimlineId, "get", {}, "administrator")
        .then((res) => {
          if (res.status === "error") {
            setIsLoading(true);
            setMessage(
              "Greška prilikom dohvaćanja podataka o vremenskoj liniji.",
            );
            return;
          }
          if (res.status === "login") {
            setIsLoggedIn(false);
            return;
          }

          setArticleTimelineData(res.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setMessage("Greška prilikom dohvaćanja podataka. Greška: " + err);
          setIsLoading(false);
        });
    }
  }, [show, articleTimlineId]);

  let genderPredao = "";
  let genderPredaoColor = "";
  let genderPruzeo = "";
  let genderPreuzeoColor = "";
  if (articleTimelineData?.user.gender === "muško") {
    genderPredao = "bi bi-gender-male";
    genderPredaoColor = "lightblue";
  } else {
    genderPredao = "bi bi-gender-female";
    genderPredaoColor = "lightpink";
  }
  if (articleTimelineData?.subbmited.gender === "muško") {
    genderPruzeo = "bi bi-gender-male";
    genderPreuzeoColor = "lightblue";
  } else {
    genderPruzeo = "bi bi-gender-female";
    genderPreuzeoColor = "lightpink";
  }
  return (
    <Modal isOpen={show} onClose={onHide} size="lg" backdrop="blur">
      <ModalContent>
        <ModalHeader>Vremenska linija artikla</ModalHeader>
        <ModalBody>
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <Avatar
                  className="avatarmodal"
                  style={{ border: `10px solid ${genderPreuzeoColor}` }}
                >
                  <i className={genderPruzeo} />
                </Avatar>
              </div>
              <div className="text-center">
                {articleTimelineData?.subbmited.fullname}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center">
              <div>{articleTimelineData?.article.stock.name}</div>
              <div className="mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="currentColor"
                  className="bi bi-arrow-right"
                  viewBox="0 0 16 16"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 8a.5.5 0 0 1 .5-.5h14.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L15.293 8.5H1.5A.5.5 0 0 1 1 8"
                  />
                </svg>
              </div>
              <div className="mt-1">{articleTimelineData?.invNumber}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-2">
                <Avatar
                  className="avatarmodal"
                  style={{ border: `10px solid ${genderPredaoColor}` }}
                >
                  <i className={genderPredao} />
                </Avatar>
              </div>
              <div className="text-center">
                {articleTimelineData?.user.fullname}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ArticleTimlineModal;
