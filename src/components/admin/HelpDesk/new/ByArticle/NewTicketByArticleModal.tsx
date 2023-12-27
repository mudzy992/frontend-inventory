import React, { useEffect, useState } from 'react'
import ArticleType from '../../../../../types/ArticleType';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from '@nextui-org/react';
import { UserRole } from '../../../../../types/UserRoleType';
import api, { ApiResponse } from '../../../../../API/api';
import { useUserContext } from '../../../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import TicketGroupType from '../../../../../types/TicketGroupType';

type ModalProps = {
    show: boolean;
    onHide: () => void;
    data: ArticleType;
  };

interface AddNewTicketState {
    userId?: number;
    articleId?: number;
    groupId?: number;
    description?: string | null;
    clientDuoDate?: Date | null;
}

const NewTicketByArticleModal: React.FC<ModalProps> = ({show, onHide, data}) => {
    const [addNewTicketState, setAddNewTicketState] = useState<AddNewTicketState>()
    const [parentGroupState, setParentGroupState] = useState<TicketGroupType[]>()
    
    const {role} = useUserContext();
    const navigate = useNavigate();
    const [message, setMessage] = useState<string>('')

    const putArticleDetailsInState = async (data: ArticleType) => {
        setAddNewTicketState({
          userId: data.userId,
          articleId: data.articleId,
          groupId: data.category?.group?.groupId,
          description: null,
          clientDuoDate: null,
        });
      };

    const setAddNewTicketFieldState = (fieldName: keyof AddNewTicketState, newValue: any) => {
        setAddNewTicketState((prev) => ({
            ...prev,
            [fieldName]: newValue,
        }));
    };

    useEffect(() => {
        if(show) {
          putArticleDetailsInState(data);  
        }
    }, [show]);

    const doAddTicket = async () => {
        try{
        await api(`api/helpdesk/`, 'post', addNewTicketState,
        role as UserRole)
        .then((res: ApiResponse) => {
            if (res.status === 'login'){
            return navigate('/login')
            }

            if(res.status === 'forbidden') {
            setMessage('Korisnik nema pravo za izmejne!')
            }
        })
        } catch(error){
            setMessage('Došlo je do greške prilikom izmjene tiketa. Greška: ' + error)
        }
    }

    return (
        <Modal
            isOpen={show}
            onOpenChange={onHide}
            backdrop='blur'
            size={'xl'}
            isDismissable={false}>
                <ModalContent>
                    <ModalHeader>
                        {data.stock?.name}
                    </ModalHeader>
                    <ModalBody>
                    <Input 
                    label="Korisnik" 
                    labelPlacement='inside' 
                    value={data.user?.fullname} />
                    <Input 
                    label="Artikal" 
                    labelPlacement='inside' 
                    value={data.stock?.name} />
                    <Input 
                    label="Grupa" 
                    labelPlacement='inside' 
                    value={data.category?.group?.groupName} />
                    <Textarea 
                    label="Opis zahtjeva"
                    placeholder='Opišite vaš problem'
                    value={addNewTicketState?.description === null ? '' : addNewTicketState?.description} 
                    onValueChange={(value: string) => setAddNewTicketFieldState('description', value)}
                    />
                    <Input 
                    label="Željeni rok izvršenja" 
                    labelPlacement='inside' 
                    value={addNewTicketState?.clientDuoDate === null ? '' : addNewTicketState?.clientDuoDate?.toDateString()}
                    onValueChange={(value: string) => setAddNewTicketFieldState('clientDuoDate', value)}
                    />
                    </ModalBody>
                    <ModalFooter>
                        <Button color='success' onClick={() => doAddTicket()}>Prijavi</Button>
                        <Button color='danger' onPress={onHide}>Zatvori</Button>
                    </ModalFooter>
                </ModalContent>

        </Modal>
  ) 
}

export default NewTicketByArticleModal
