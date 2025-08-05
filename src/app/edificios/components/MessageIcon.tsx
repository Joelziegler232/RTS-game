import React, { useState } from "react";
import Inbox from "./Inbox";

const MessageIcon = () => {
  const [showInbox, setShowInbox] = useState(false);

  const toggleInbox = () => {
    setShowInbox(!showInbox);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={toggleInbox}>Mostrar Buzón</button>
      {showInbox && <Inbox />}
    </div>
  );
};

export default MessageIcon;