import React from "react";
import "../../App.css";

function ChatMessage({ auth, message, uid, photoURL }) {
  const messagesClass = uid === auth.currentUser.uid ? "sent" : "received";
  return (
    <div className={`message ${messagesClass}`}>
      <img src={photoURL} alt="" />
      <p>{message}</p>
    </div>
  );
}

export default ChatMessage;
