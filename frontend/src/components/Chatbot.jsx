import React, { useState, useEffect } from "react";
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

  const handleReset = () => {
    setMessages([]);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        fetch("http://localhost:3000/greeting", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message:
              "Introduce yourself as Tinnie.  I help you to choose an insurance policy.  May I ask you a few personal questions to make sure I recommend the best policy for you?. You will only ask more questions if the user agrees to be asked. ",
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: data.reply, user: "bot" },
            ]);
          });
      } catch (err) {
        console.log(err);
      }
      /*setMessages([
        { text: "Hello! How can I assist you today?", user: "bot" },
      ]);*/
    }, 1000); // 1 second delay

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);
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
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default Chatbot;
