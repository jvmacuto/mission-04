import React, { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [accumulatedMessages, setAccumulatedMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    console.log("Click button ran here!");

    // Check if input is empty
    if (!input.trim()) return;

    //add user message and clear input field
    const newUserMessage = {
      user: "user",
      text: input,
      timestamp: Date.now(),
    };

    //add message to the state and clear input field
    const newMessages = [...messages, newUserMessage];
    setMessages(newMessages);

    //clear input field
    setInput("");

    //send user message to backend
    if (questionCount < 6) {
      //add question to limit questions
      setQuestionCount(questionCount + 1);

      console.log(questionCount);
      try {
        fetch("http://localhost:3000/input", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: input }),
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

            // Ensure formattedMessage is defined before calling replace
            if (formattedMessage) {
              formattedMessage = formattedMessage.replace(
                /(?:\r\n|\r|\n)/g,
                "<br>"
              );
            }

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: formattedMessage,
                user: "bot",
                timeStamp: Date.now(),
                className: "chatbot-message.bot",
              },
            ]);
          })
          .catch((err) => {
            console.log(err);
          });

        // Add message to accumulatedMessages with key, user, and message
        setAccumulatedMessages([
          ...accumulatedMessages,
          { key: accumulatedMessages.length, user: "user", message: input },
        ]);
      } catch (err) {
        console.log(err);
      }
    } else if (questionCount === 6) {
      //ai will thank user for chatting
      const newAiMessage = {
        text: "Thank you for chatting with me! I will now provide your feedback.",
        user: "bot",
        timeStamp: Date.now(),
      };
      setMessages((prevMessages) => [...prevMessages, newAiMessage]);
      try {
        fetch("http://localhost:3000/recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: accumulatedMessages }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            const aiMessage = data.recommendation;
            let formattedMessage = aiMessage;
            if (typeof aiMessage === "object" && aiMessage.parts) {
              formattedMessage = aiMessage.parts
                .map((part) => part.text)
                .join(" ");
            }

            // Ensure formattedMessage is a string before calling replace
            if (formattedMessage) {
              formattedMessage = formattedMessage.replace(
                /(?:\r\n|\r|\n)/g,
                "<br>"
              );
            }

            setMessages((prevMessages) => [
              ...prevMessages,
              {
                text: formattedMessage,
                user: "bot",
                timeStamp: Date.now(),
                className: "chatbot-message.bot",
              },
            ]);
          })
          .catch((err) => {
            console.log(err);
          });
      } catch (err) {
        console.log(err);
      }
    }
  };
  // To prevent adding the feedback message multiple times
  /*try {
        const combinedMessages = accumulatedMessages.join(" ");
        fetch("http://localhost:3000/recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: combinedMessages }),
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: data.reply, user: "bot" },
            ]);
          })
          .catch((error) => {
            console.error("Error:", error);
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
      }*/

  const handleReset = () => {
    setMessages([]);
    setQuestionCount(0);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        fetch("http://localhost:3000/input", {
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

  const renderMessage = (message) => {
    const formattedMessage = message
      .replace(/##\s(.+?)\n/g, "<h2>$1</h2>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*\s(.+?)(?=\n|$)/g, "<li>$1</li>")
      .replace(/\n/g, "<br>");
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
        <div ref={messagesEndRef} />
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button onClick={handleSend}>Send</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default Chatbot;
