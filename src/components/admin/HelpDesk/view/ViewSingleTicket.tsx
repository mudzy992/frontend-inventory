import React, { useEffect, useState } from 'react'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Chip, Tabs, Tab } from '@nextui-org/react';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import ArticleType from '../../../../types/ArticleType';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';
import Moment from 'moment';

type ModalProps = {
    show: boolean;
    onHide: () => void;
    data: HelpdeskTicketsType[];
    ticketId: number;
  };

const ViewSingleTicketModal: React.FC<ModalProps> = ({show, onHide, data, ticketId}) => {
    const [ticketState, setTicketState]= useState<HelpdeskTicketsType>()

    useEffect(() => {
        if (show && data) {
            const selectedTicket = data.find(ticket => ticket.ticketId === ticketId);
            setTicketState(selectedTicket);
        }
    }, [show, data, ticketId]);

    return (
        <Modal
            isOpen={show}
            onOpenChange={onHide}
            backdrop='blur'
            size={'5xl'}
            isDismissable={false}
            scrollBehavior='inside'
            >
                <ModalContent>
                    <ModalHeader className='flex justify-between'>
                         <div>Tiket <span className='text-default-700'>#{ticketState?.ticketId}</span></div> <div className='mr-3'><Chip color='success'>{ticketState?.status}</Chip></div>
                    </ModalHeader>
                    <ModalBody>
                        <Tabs aria-label='Opcije'
                                color='primary' 
                                radius='full'>
                            <Tab title="Detalji tiketa" key={'ticket-details'}>
                                <div className='grid grid-cols lg:grid-cols-12 gap-2'>
                                    <div className='grid lg:col-span-4 col-span gap-2 grid-flow-row auto-rows-max' >
                                        <Input 
                                        label="Grupa" 
                                        labelPlacement='inside' 
                                        value={ticketState?.group?.groupName} />
                                        <Input 
                                        label="Vrsta zahtjeva" 
                                        labelPlacement='inside' 
                                        value={ticketState?.groupPartent?.groupName} />
                                        <Input 
                                        label="Datum prijave" 
                                        labelPlacement='inside' 
                                        value={Moment(ticketState?.createdAt).format('DD.MM.YYYY - HH:mm')} />
                                        <Input 
                                        label="Željeni datum rješnjenja" 
                                        labelPlacement='inside' 
                                        value={Moment(ticketState?.clientDuoDate).format('DD.MM.YYYY - HH:mm')} />
                                        {ticketState?.status === 'zatvoren' ? (
                                            <Input 
                                            label="Datum rješenja tiketa" 
                                            labelPlacement='inside' 
                                            value={Moment(ticketState?.resolveDate).format('DD.MM.YYYY - HH:mm')} />
                                        ) :(<div></div>)}
                                        {ticketState?.status !== 'otvoren' ? (
                                            <Input 
                                            label="Tiket preuzeo" 
                                            labelPlacement='inside' 
                                            value={ticketState?.assignedTo2?.fullname} />
                                        ) :(<div></div>)}
                                    </div>
                                    <div className='grid lg:col-span-8 col-span gap-2 auto-rows-max w-full'>
                                        <Textarea 
                                        isReadOnly
                                        label="Opis problema"
                                        type='text'
                                        value={ticketState?.description}
                                        className='w-full'
                                        />
                                        {ticketState?.status === 'zatvoren' ? (
                                            <Textarea 
                                            isReadOnly
                                            label="Rješenje problema"
                                            type='text'
                                            value={ticketState?.resolveDescription}
                                            />
                                        ) :(<div></div>)}
                                    </div>
                                </div>
                            </Tab>
                            <Tab className={ticketState?.article === undefined ? "hidden" : "inline"} title="Detalji opreme" key={'article-details'}>
                                <div className='grid grid-cols lg:grid-cols-12 gap-2'>
                                    <div className='grid lg:col-span-4 col-span gap-2 grid-flow-row auto-rows-max' >
                                        <Input 
                                        label="Naziv" 
                                        labelPlacement='inside' 
                                        value={ticketState?.article?.stock?.name} />

                                        <Input 
                                        label="Podgrupa" 
                                        labelPlacement='inside' 
                                        value={ticketState?.article?.invNumber} />

                                        <Input 
                                        label="Datum prijave" 
                                        labelPlacement='inside' 
                                        value={ticketState?.article?.serialNumber} />
                                    </div>
                                </div>
                            </Tab>
                        </Tabs>
                        
                    </ModalBody>
                    <ModalFooter>
                        <Button color='danger' onPress={onHide}>Zatvori</Button>
                    </ModalFooter>
                </ModalContent>

        </Modal>
  ) 
}

export default ViewSingleTicketModal
