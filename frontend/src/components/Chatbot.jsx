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
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const aiMessage = data.reply;

            // Check if aiMessage is an object and extract the necessary parts
            let formattedMessage = aiMessage;
            if (typeof aiMessage === "object") {
              formattedMessage = aiMessage.parts
                .map((part) => part.text)
                .join(" ");
            }

            console.log("Full message from AI:", formattedMessage); // Log the message

            setTimeout(() => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { text: formattedMessage, user: "bot" },
              ]);
            }, 1000);
          })
          .catch((error) => {
            console.error("Error during fetch:", error);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: "Sorry, something went wrong. Please try again later.",
                user: "bot",
              },
            ]);
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
        fetch("http://localhost:3000/hello", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message:
              "Introduce yourself as Tinnie. I help you to choose an insurance policy. May I ask you a few personal questions to make sure I recommend the best policy for you? You will only ask more questions if the user agrees to be asked. Please respond in British English.",
          }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const aiMessage = data.reply;
            let formattedMessage = aiMessage;
            if (typeof aiMessage === "object" && aiMessage.parts) {
              formattedMessage = aiMessage.parts
                .map((part) => part.text)
                .join(" ");
            }

            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedMessage, user: "bot" },
            ]);
          })
          .catch((error) => {
            console.error("Error during fetch:", error);
            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: "Sorry, something went wrong. Please try again later.",
                user: "bot",
              },
            ]);
          });
      } catch (err) {
        console.log(err);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer); // Cleanup the timer on component unmount
  }, []);

  // Function to convert text to formatted HTML
  const renderMessage = (message) => {
    // Replace markdown syntax with HTML and apply more professional formatting
    const formattedMessage = message
      .replace(/##\s(.+?)\n/g, "<h2>$1</h2>") // Header level 2
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>") // Bold text
      .replace(/\*\s(.+?)(?=\n|$)/g, "<li>$1</li>") // List item
      .replace(/\n/g, "<br>"); // Line breaks
    return <div dangerouslySetInnerHTML={{ __html: formattedMessage }} />;
  };

  return (
    <div className="chatbot">
      <div className="chatbot-messages">
        {messages.map((message, index) => (
          <div key={index} className={`chatbot-message ${message.user}`}>
            {renderMessage(message.text)}
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
