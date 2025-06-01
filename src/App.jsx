import React, { useState, useRef, useEffect } from "react";
import './App.css';
import { io } from "socket.io-client";

// Replace with your server IP
const socket = io("https://chat-backend-tr1l.onrender.com");

function App() {
  const [userId, setUserId] = useState("");
  const [receiverId, setReceiverId] = useState("");
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const messageEndRef = useRef(null);

  useEffect(() => {
    // Once userId is set, register with the server
    if (userId) {
      socket.emit("register", userId);
    }

    // Listen for private messages
   socket.on("receive_private_message", ({ senderId, message }) => {
  let index = 0;
  let text = "";

  // Add an empty message first to simulate typing
  setChat(prev => [...prev, { sender: senderId, text: "" }]);

  const typingInterval = setInterval(() => {
    text += message[index];
    index++;

    // Update the last message
    setChat(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { sender: senderId, text };
      return updated;
    });

    if (index >= message.length) {
      clearInterval(typingInterval);
    }
  }, 50);
});


    return () => {
      socket.off("receive_private_message");
    };
  }, [userId]);

  const handleSend = () => {
    if (!input.trim() || !userId || !receiverId) return;

    const newMessage = {
      senderId: userId,
      receiverId: receiverId,
      message: input.trim(),
    };

    setChat([...chat, { sender: "me", text: input.trim() }]);
    socket.emit("send_private_message", newMessage);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="container">
      <div className="chat-container">
        <div className="header">
          <h2>Private Chat</h2>
        </div>

        {/* Login Section */}
        <div className="auth-section">
          <input
            placeholder="Your ID (e.g. user1)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <input
            placeholder="Send to (e.g. user2)"
            value={receiverId}
            onChange={(e) => setReceiverId(e.target.value)}
          />
        </div>

        {/* Chat Messages */}
        <div className="chat-box">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={msg.sender === "me" ? "user-message" : "bot-message"}
            >
              <strong>{msg.sender === "me" ? "You" : msg.sender}:</strong> {msg.text}
            </div>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* Input Box */}
        <div className="chat-bottom">
          <textarea
            placeholder="Type a message..."
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="sendBtn" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
