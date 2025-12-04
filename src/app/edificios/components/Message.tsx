import React from "react";

const Message = ({ sender, content }: { sender: string; content: string }) => {
  return (
    <div>
      <p>De: {sender}</p>
      <p>{content}</p>
    </div>
  );
};

export default Message;