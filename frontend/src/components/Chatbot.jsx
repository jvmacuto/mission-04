import React, { useState } from "react";
import "../styles/chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, user: "user" }]);
      const userMessage = input;
      setInput("");

      try {
        fetch("http://localhost:3000/hello", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: userMessage }),
        })
          .then((response) => response.json())
          .then((data) => {
            setTimeout(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { text: data.reply, user: "bot" },
              ]);
            }, 1000);
          });
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.user}`}>
            {message.text}
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;
