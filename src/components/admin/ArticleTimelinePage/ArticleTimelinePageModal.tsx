import { FC, useEffect, useState } from "react";
import api from "../../../API/api";
import { Col, Row } from "react-bootstrap";
import "./styleArticleTimeline.css";
import { Avatar, Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";

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
        stock:{
            name: string;
            valueOnContract: number;
            valueAvailable: number;
        }
    };
    user: {
        fullname: string;
        gender: string;
    };
    subbmited: {
        fullname: string;
        gender: string;
    }
}

const ArticleTimlineModal: FC<ArticleTimelineProps> = ({show, onHide, articleTimlineId}) => {
    const [articleTimelineData, setArticleTimelineData] = useState<ArticleTimlineType | null>(null)
    const [isLoading, setIsLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [message, setMessage] = useState<string>()
    useEffect(() =>{
        if(show){
            setIsLoading(true)
            api('api/articleTimeline/'+ articleTimlineId, 'get', {}, 'administrator')
            .then((res) => {
                if(res.status === 'error') {
                    setIsLoading(true)
                    setMessage('Greška prilikom dohvaćanja podataka o vremenskoj liniji.')
                    return
                }
                if(res.status === 'login') {
                    setIsLoggedIn(false)
                    return
                }
                
                setArticleTimelineData(res.data)
                setIsLoading(false)
            })
            .catch((err) => {
                setMessage('Greška prilikom dohvaćanja podataka. Greška: ' + err)
                setIsLoading(false);
            })
        }
    }, [show, articleTimlineId])

    let genderPredao = '';
    let genderPredaoColor = '';
    let genderPruzeo = '';
    let genderPreuzeoColor = '';
    if(articleTimelineData?.user.gender === 'muško') {
        genderPredao = 'bi bi-gender-male'
        genderPredaoColor = 'lightblue'
    } else {
        genderPredao = 'bi bi-gender-female'
        genderPredaoColor = 'lightpink'
    }
    if(articleTimelineData?.subbmited.gender === 'muško') {
        genderPruzeo = 'bi bi-gender-male'
        genderPreuzeoColor = 'lightblue'
    } else {
        genderPruzeo = 'bi bi-gender-female'
        genderPreuzeoColor = 'lightpink'
    }
    return(
        <Modal
        isOpen={show}
        onClose={onHide}
        size='lg'
        backdrop="blur"
        >
            <ModalContent>            
                <ModalHeader >
                        Vremenska linija artikla
                </ModalHeader>
                <ModalBody>
                    <Row style={{display:'flex', justifyContent:'center', alignItems:'center'}}>
                        <Col >
                            <Col className="mb-2" lg={12} xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
                                <Avatar className="avatarmodal" style={{border: `10px solid ${genderPreuzeoColor}`}}> 
                                    <i className={genderPruzeo}/>
                                </Avatar>
                            </Col>
                            <Col lg={12} xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
                                {articleTimelineData?.subbmited.fullname}
                            </Col>
                        </Col>
                        <Col style={{display:'flex', justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
                            <Row>
                                {articleTimelineData?.article.stock.name}
                            </Row>
                            <Row>
                                <svg xmlns="http://www.w3.org/2000/svg" width="500" height="20" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 110 18">
                                <path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h111.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L113.293 8.5H1.5A.5.5 0 0 1 1 8"/>
                                </svg>
                            </Row>
                            <Row>
                                <Col>
                                {articleTimelineData?.invNumber}
                                </Col>
                            </Row>
                        </Col>
                        <Col>
                            <Col className="mb-2" lg={12} xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
                                <Avatar className="avatarmodal" style={{border: `10px solid ${genderPredaoColor}`}}> 
                                    <i className={genderPredao}/>
                                </Avatar>
                            </Col>
                            <Col lg={12} xs={12} style={{display:'flex', justifyContent:'center', alignItems:'center', flexWrap:'wrap'}}>
                                {articleTimelineData?.user.fullname}
                            </Col>
                        </Col>
                        
                    </Row>
                </ModalBody>
            </ModalContent>
        </Modal>
    )
}

export default ArticleTimlineModal;