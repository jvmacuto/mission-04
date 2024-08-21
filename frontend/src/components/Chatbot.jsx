import { useState, useEffect, useRef } from "react";
import "../styles/chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [conversationState, setConversationState] = useState([]);
  const [input, setInput] = useState("");
  const [accumulatedMessages, setAccumulatedMessages] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const messagesEndRef = useRef(null);

  const [isChatActive, setIsChatActive] = useState(true);
  const [isInitialQuestionAsked, setIsInitialQuestionAsked] = useState(false);

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

    // Handle initial yes/no question
    if (!isInitialQuestionAsked) {
      if (input.toLowerCase() === "yes") {
        const newAiMessage = {
          user: "bot",
          text: "Great! Let's get started.",
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, newAiMessage]);
        setIsInitialQuestionAsked(true);
      } else if (input.toLowerCase() === "no") {
        const newAiMessage = {
          user: "bot",
          text: "Goodbye! Have a great day!",
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, newAiMessage]);
        setIsChatActive(false);
      } else {
        const newAiMessage = {
          user: "bot",
          text: "Please answer with 'yes' or 'no'.",
          //set delay
          timestamp: Date.now(),
        };
        setMessages((prevMessages) => [...prevMessages, newAiMessage]);
      }
    } else {
      // Send message to backend or handle further conversation

      setQuestionCount(questionCount + 1);
      if (questionCount < 5) {
        //setaccumulatedmessage to add key and message
        setAccumulatedMessages([
          ...accumulatedMessages,
          { key: questionCount, message: input },
        ]);

        fetch("http://localhost:3000/chat", {
          // Send user message to backend
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: input,
            questionCount: questionCount,
            conversationState: conversationState, // Send conversation state to backend
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
            const newConversationState = data.conversationState;
            let formattedMessage = aiMessage;

            // Update the conversation state in the client
            setConversationState(newConversationState);
            if (typeof aiMessage === "object" && aiMessage.parts) {
              formattedMessage = aiMessage.parts
                .map((part) => part.text)
                .join(" ");
            }

            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedMessage, user: "bot" },
            ]);
          });
      } else if (questionCount === 5) {
        console.log("accumulatedMessages", accumulatedMessages);

        //fetch recommendation
        fetch("http://localhost:3000/recommendation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(accumulatedMessages),
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

            setMessages((prevMessages) => [
              ...prevMessages,
              { text: formattedMessage, user: "bot" },
            ]);
          });
      }
    }
  };

  const handleReset = () => {
    setMessages([]);
    setQuestionCount(0);
    setIsInitialQuestionAsked(false);
    setIsChatActive(true);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const delayDuration = 2000; // 2 seconds delay
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
    }, delayDuration); // 1 second delay

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
        {isChatActive && (
          <form onSubmit={handleSend}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </form>
        )}
        <button onClick={handleSend}>Send</button>
        <button onClick={handleReset}>Reset</button>
      </div>
    </div>
  );
};

export default Chatbot;
