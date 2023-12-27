import React, { useEffect, useState } from 'react'
import ArticleType from '../../../../../types/ArticleType';
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Select, SelectItem } from '@nextui-org/react';
import { UserRole } from '../../../../../types/UserRoleType';
import api, { ApiResponse } from '../../../../../API/api';
import { useUserContext } from '../../../../UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import TicketGroupType from '../../../../../types/TicketGroupType';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

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
    groupPartentId?: number | null
}

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const NewTicketByArticleModal: React.FC<ModalProps> = ({show, onHide, data}) => {
    const [addNewTicketState, setAddNewTicketState] = useState<AddNewTicketState>()
    const [parentGroupState, setParentGroupState] = useState<TicketGroupType[]>([])
    
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
          groupPartentId: null,
        });
      };

    const setAddNewTicketFieldState = (fieldName: keyof AddNewTicketState, newValue: any) => {
        setAddNewTicketState((prev) => ({
            ...prev,
            [fieldName]: newValue,
        }));
        console.log(fieldName, newValue)
    };

    const handleDatePickerChange = (newValue: Value) => {
        setAddNewTicketFieldState('clientDuoDate', newValue);
      };

    useEffect(() => {
        if(show) {
          putArticleDetailsInState(data);
          
        }
        if(addNewTicketState?.groupId){
            getParentGroupData() 
        }
    }, [show, addNewTicketState?.groupId]);

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

    const getParentGroupData = () => {   
        api(`api/ticket/group/parent/${addNewTicketState?.groupId}`, "get", {}, role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login') {
                    setMessage('Greška prilikom učitavanja podataka. Korisnik nije prijavljen!');
                    return;
                }
                if (res.status === 'error') {
                    setMessage('Greška prilikom učitavanja podataka, molimo pokušajte ponovo!');
                    return;
                }
                if (res.status === 'forbidden') {
                    setMessage('Korisnik nema prava za učitavanje ove vrste podataka!');
                    return;
                }
                setParentGroupState(res.data);
            })
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
                    <Select
                        id='groupId'
                        label='Grupa'
                        placeholder='Odaberite grupu'
                        value={addNewTicketState?.groupId}
                        onChange={(value) => setAddNewTicketFieldState('groupPartentId', value.target.value)}
                        >
                        {parentGroupState.map((group, index) => (
  <SelectItem 
    key={group.groupId || index} 
    textValue={`${group.groupId} - ${group.groupName}`}
    value={Number(group.groupId)}
  >
    <div className="flex gap-2 items-center">
      <div className="flex flex-col">
        <span className="text-small">{group.groupName}</span>
        <span className="text-tiny text-default-400">{group.location?.name}</span>
      </div>
    </div>
  </SelectItem>
))}



                    </Select> 
                    <Textarea 
                    label="Opis zahtjeva"
                    placeholder='Opišite vaš problem'
                    value={addNewTicketState?.description === null ? '' : addNewTicketState?.description} 
                    onValueChange={(value: string) => setAddNewTicketFieldState('description', value)}
                    />
                    <div className={'pr-3 pl-3 pt-3 pb-2 bg-default-100 rounded-xl w-full grid grid-rows-2'}  style={{zIndex:1000}}>
                        <span className='text-xs text-default-600'>Željeni datum rješenja</span>
                        <DatePicker
                        onChange={handleDatePickerChange} 
                        value={addNewTicketState?.clientDuoDate || null} 
                        />
                    </div>
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
