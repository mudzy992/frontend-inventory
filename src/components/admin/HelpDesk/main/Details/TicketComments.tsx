import { List, Input, Button, Avatar, Typography, Card } from 'antd';
import { useState } from 'react';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';
import { useUserContext } from '../../../../Contexts/UserContext/UserContext';

const { Text } = Typography;

interface TicketCommentsProps {
  ticket: HelpdeskTicketsType | null;
}

const TicketComments = ({ ticket }: TicketCommentsProps) => {
  const [newComment, setNewComment] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const { role, userId } = useUserContext();

  const handleAddComment = () => {
    // Logika za dodavanje komentara
    setNewComment('');
    setReplyToCommentId(null); // Resetuj nakon dodavanja komentara
  };

  const handleReplyToComment = (commentId: number) => {
    setReplyToCommentId(commentId);
  };

  const renderComment = (comment: any) => {
    const isReply = comment.parentCommentId !== null;

    return (
      <List.Item style={{ marginBottom: '20px' }}>
        <List.Item.Meta
          avatar={<Avatar>{comment.user.forname[0]}{comment.user.surname[0]}</Avatar>}
          title={comment.user.fullname}
          description={
            <div>
              <Text>{comment.text}</Text>
              <div>{new Date(comment.createdAt).toLocaleString()}</div>
            </div>
          }
        />
        {comment.comments && comment.comments.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={comment.comments}
            renderItem={renderComment}
            style={{ marginLeft: '30px' }} 
          />
        )}
        {ticket?.userId === userId && replyToCommentId === null && !isReply && (
          <Button onClick={() => handleReplyToComment(comment.commentId)} size="small" style={{ marginTop: '10px' }}>
            Odgovori
          </Button>
        )}
      </List.Item>
    );
  };

  return (
    <div>
      <List
        itemLayout="vertical"
        dataSource={ticket?.comments}
        renderItem={renderComment}
        locale={{ emptyText: "Nema traženih dodatnih infomacija za ovaj tiket" }}
      />
     {ticket?.assignedTo === userId && !replyToCommentId && (
        <div>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Opis tražene informacije"
          />
          <Button onClick={handleAddComment} style={{ marginTop: '10px' }}>Traži infomaciju</Button>
        </div>
      )}

      {replyToCommentId !== null && (
        <div>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Odgovor na traženu informaciju"
          />
          <Button onClick={handleAddComment} style={{ marginTop: '10px' }}>Dodaj odgovor</Button>
        </div>
      )}
    </div>
  );
};

export default TicketComments;
