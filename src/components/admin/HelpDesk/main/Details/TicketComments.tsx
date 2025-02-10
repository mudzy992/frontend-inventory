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
        {/* Renderovanje odgovora na main komentar */}
        {comment.comments && comment.comments.length > 0 && (
          <List
            itemLayout="horizontal"
            dataSource={comment.comments}
            renderItem={renderComment}
            style={{ marginLeft: '30px' }} // Stilizovanje odgovora da bude uvučeno
          />
        )}
        {/* Prikazivanje dugmeta za odgovaranje samo ako je korisnik prijavljen i nije autor komentara */}
        {ticket?.userId === userId && replyToCommentId === null && !isReply && (
          <Button onClick={() => handleReplyToComment(comment.commentId)} size="small" style={{ marginTop: '10px' }}>
            Reply
          </Button>
        )}
      </List.Item>
    );
  };

  return (
    <div>
      {/* Lista komentara */}
      <List
        itemLayout="vertical"
        dataSource={ticket?.comments}
        renderItem={renderComment}
      />

      {/* Input za novi komentar prikazuje se samo ako je korisnik dodeljen tiket (assignedTo) */}
      {ticket?.assignedTo === userId && !replyToCommentId && (
        <div>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Add a comment"
          />
          <Button onClick={handleAddComment} style={{ marginTop: '10px' }}>Add Comment</Button>
        </div>
      )}

      {/* Input za odgovor na komentar */}
      {replyToCommentId !== null && (
        <div>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            placeholder="Reply to the comment"
          />
          <Button onClick={handleAddComment} style={{ marginTop: '10px' }}>Add Reply</Button>
        </div>
      )}
    </div>
  );
};

export default TicketComments;
