import React, { useEffect, useState } from 'react'
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Chip, Tabs, Tab, Avatar, Divider, Link, Spinner } from '@nextui-org/react';
import HelpdeskTicketsType from '../../../../types/HelpdeskTicketsType';
import Moment from 'moment';
import { useUserContext } from '../../../UserContext/UserContext';
import { UserRole } from '../../../../types/UserRoleType';
import api, { ApiResponse } from '../../../../API/api';
import { useNavigate } from 'react-router-dom';

type ModalProps = {
    show: boolean;
    onHide: () => void;
    data: HelpdeskTicketsType[];
    ticketId: number;
  };

interface AddNewComment {
text: string;
ticketId: number;
userId: number;
    reply:{
        text?: string;
        ticketId?: number;
        userId?: number;
    }
}

const ViewSingleTicketModal: React.FC<ModalProps> = ({show, onHide, data, ticketId}) => {
    const {role, userId} = useUserContext();
    const [ticketState, setTicketState]= useState<HelpdeskTicketsType>();
    const [selectedCommentId, setSelectedCommentId] = useState(null);
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [message, setMessage] = useState<string>('')
    const [addNewCommentReplyState, setAddNewCommentReplyState] = useState<AddNewComment>({
        text: '',
        ticketId: 0,
        userId: 0,
        reply:{}
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (show && data) {
            const selectedTicket = data.find(ticket => ticket.ticketId === ticketId);
            setTicketState(selectedTicket);
        }
    }, [show, data, ticketId]);

    const setAddNewCommentReplyStringFieldState = (fieldName: string, newValue: any) => {
        setAddNewCommentReplyState((prev) => {
            const newReply = {
                ...prev.reply,
                [fieldName]: newValue,
            };        
            return {
                ...prev,
                reply: newReply,
            };
        });
    };

    const handleReplyClick = (commentId: any) => {
        if (selectedCommentId === commentId) {
          setSelectedCommentId(null);
        } else {
          setSelectedCommentId(commentId);
        }
    };

    const doAddNewReply = async (commentId: number) => {
        try {
            setIsLoading(true)
            await api(`api/comment/reply/${commentId}`, 'post', {
                text: addNewCommentReplyState.reply?.text,
                ticketId: ticketId,
                userId: userId,
            },
            role as UserRole)
            .then((res: ApiResponse) => {
                if (res.status === 'login'){
                return navigate('/login')
                }

                if(res.status === 'forbidden') {
                setMessage('Korisnik nema pravo za izmejne!')
                }
            })
            .finally(() => {
                setSelectedCommentId(null)
                setAddNewCommentReplyStringFieldState('text', '')
                setIsLoading(false)
            })
        } catch(error) {
            setMessage('Došlo je do greške prilikom izmjene tiketa. Greška: ' + error);
        }
    }

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
                            <Tab key="conversation" isDisabled={totalComments() === 0} title={<div><span>Informacija</span> {totalComments() > 0 ? (<Chip size='sm' color='danger'>{totalComments()}</Chip>):(<div></div>)}</div>}>
                                {conversation()}
                            </Tab>
                        </Tabs>
                    </ModalBody>
                    <ModalFooter>
                        <Button color='danger' onPress={onHide}>Zatvori</Button>
                    </ModalFooter>
                </ModalContent>

        </Modal>
    )

    function conversation() {
        return (
            isLoading ? (
            <div className="flex justify-center items-center">
                <Spinner label="Učitavanje..." labelColor="warning" color='warning' />
            </div> ) : (
            <div className='w-full'>
            {ticketState?.comments ? ticketState?.comments
            .filter((comment) => !comment.parentCommentId)
            .map((comment, index) => (
                <div >
                    <div id='kontejner-komentara' className='flex justify-end mb-2' >
                        <div id='komentar' className=' w-full flex flex-row'>
                            <div className='lg:w-full'>
                                <div className='flex flex-row mb-1'>
                                    <div id='avatar-komentara' className='flex items-center mr-3'>
                                        <Avatar 
                                        name={combineFirstLetters(comment.user?.surname || '', comment.user?.forname || '')}
                                        color='warning' 
                                        isBordered 
                                        size='md' />
                                    </div>
                                    <div className='grid grid-flow-row p-3 text-sm rounded-xl bg-default-100 shadow w-full'>
                                        <div className='h-full flex justify-between'>
                                            <span className='text-sm font-bold text-default-700'>{comment?.user?.fullname}</span>
                                            <Link onClick={() => handleReplyClick(comment?.commentId!) }>
                                                <span className='ml-2 text-sm cursor-pointer'>Odgovori</span></Link>
                                        </div>
                                        <Divider className='my-1'/>
                                        <div className='w-full'>
                                            {comment?.text}
                                        </div> 
                                    </div>
                                </div>
                                <div className='flex justify-end'>
                                    <span className='text-tiny text-default-400 mr-2'>{formatDateTime(comment.createdAt!)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`col-span-12 ${selectedCommentId === comment?.commentId ? 'inline' : 'hidden'}`} id='reply'>
                        <Textarea
                            type='text'
                            value={addNewCommentReplyState.reply?.text}
                            onValueChange={(value: string) => setAddNewCommentReplyStringFieldState('text', value)}
                            placeholder='Upišite odgovor' />

                        <div className="flex justify-end mb-2">
                            <Button color='primary' size='sm' variant='flat' className='mt-2' onPress={() => doAddNewReply(comment?.commentId!)}>
                                Odgovori
                            </Button>
                        </div>
                    </div>
                    {comment?.comments ? (
                        comment.comments.map((replies) => (
                            <div id='kontejner-odgovora-komentara' className='flex justify-end mb-2' >
                                <div id='replies' className='w-full flex flex-row justify-end'>
                                    <div className='lg:w-full'>
                                        <div className='flex flex-row'>
                                            <div className='grid grid-flow-row p-3 text-sm rounded-xl bg-default-100 shadow w-full'>
                                                <span className='text-sm font-bold text-default-700'>{replies.user?.fullname}</span>
                                                <Divider className='my-1'/>
                                                <div className='w-full'>
                                                    {replies.text}
                                                </div> 
                                            </div>
                                            <div id='avatar-odgovora-komentara' className='flex items-center ml-3'>
                                                <Avatar
                                                name={combineFirstLetters(replies.user?.surname || '', replies.user?.forname || '')}
                                                color='default' 
                                                isBordered 
                                                size='md' />
                                            </div>
                                        </div>
                                        <div>
                                            {formatDateTime(replies.createdAt!)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (<div></div>)}
                </div>
            )) : []}
            </div>
        ));
    }

    function totalComments() {
        let total: number = 0;
        const main = ticketState?.comments?.length || 0;
        const replies = (ticketState?.comments || []).map((replies) => replies?.comments?.length || 0);
        if (replies.length > 0) {
        total = main + replies.reduce((acc, curr) => acc + curr);
        } else {
        total = main;
        }
        return total
    }

    function combineFirstLetters(surname: string, forname: string) {
        const inicialLetters = surname.charAt(0).toUpperCase() + forname.charAt(0).toUpperCase()
        return inicialLetters
    }

    function formatDateTime(dateTimeString: Date): any {
        const now: Date = new Date();
        const pastDate: Date = new Date(dateTimeString);
        const timeDifference: number = now.getTime() - pastDate.getTime();
      
        const seconds: number = Math.floor(timeDifference / 1000);
        const minutes: number = Math.floor(seconds / 60);
        const hours: number = Math.floor(minutes / 60);
        const days: number = Math.floor(hours / 24);
      
        if (seconds < 60) {
            <span className='text-tiny text-default-400 ml-2'>
            <i className="bi bi-clock-history"></i> prije nekoliko trenutaka
          </span>
        } else if (minutes < 60) {
          return (<span className='text-tiny text-default-400 ml-2'><i className="bi bi-clock-history"></i> prije {minutes} {minutes === 1 ? 'minutu' : 'minuta'}</span>);
        } else if (hours < 24) {
          return (<span className='text-tiny text-default-400 ml-2'>
            <i className="bi bi-clock-history"></i> prije {hours}
            {hours === 1 ? ' sat' : (hours === 21 ? ' sat' : ([2,3,4,22,23,24].includes(seconds)) ? ' sata' : ' sati')}
          </span>);
        } else if (days < 7) {
          return (<span className='text-tiny text-default-400 ml-2'><i className="bi bi-calendar4-week"></i> prije {days} {days === 1 ? 'dan' : 'dana'}</span>);
        } else {
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };
          return (<span className='text-tiny text-default-400 ml-2'><i className="bi bi-calendar4-week"></i> {pastDate.toLocaleDateString(undefined, options)}</span>);
        }
    }
}

export default ViewSingleTicketModal
