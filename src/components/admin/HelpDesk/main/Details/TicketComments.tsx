import { List, Input, Button } from 'antd';
import { useState } from 'react';
import HelpdeskTicketsType from '../../../../../types/HelpdeskTicketsType';

interface TicketCommentsProps {
  ticket: HelpdeskTicketsType | null;
}

const TicketComments = ({ ticket }: TicketCommentsProps) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    setNewComment('');
  };

  return (
    <div>
      <List
        dataSource={ticket?.comments}
        renderItem={(comment) => (
          <List.Item>
            {/* <Comment />
            <Comment author={comment.author} content={comment.content} /> */}
          </List.Item>
        )}
      />
      <Input.TextArea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        rows={4}
        placeholder="Add a comment"
      />
      <Button onClick={handleAddComment}>Add Comment</Button>
    </div>
  );
};

export default TicketComments;
