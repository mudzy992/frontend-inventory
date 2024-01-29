import { FC, useEffect, useState } from "react";
import api from "../../../API/api";
import "./styleArticleTimeline.css";
import {
  Avatar,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Progress,
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
    <Modal isOpen={show} onClose={onHide} size="2xl" backdrop="blur">
      <ModalContent>
        <ModalHeader>Vremenska linija artikla</ModalHeader>
        <ModalBody>
          <div className="flex w-full justify-between">
            <div className="flex flex-col items-center flex-wrap w-[35%]">
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
            <div className="flex items-center justify-center flex-col w-full pl-3 pr-3">
              <div>{articleTimelineData?.article.stock.name}</div>
                <Progress
                  size="sm"
                  isIndeterminate
                  aria-label="Loading..."
                  className="max-w-md"
                />
              <div className="mt-1">{articleTimelineData?.invNumber}</div>
            </div>
            <div className="flex flex-col items-center flex-wrap w-[35%]">
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
