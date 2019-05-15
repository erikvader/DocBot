import Message from "./Message";

// This is the main display of the application. It shows a list of all the
// messages which have been sent and received during the current chat session.
class Messages extends React.Component {
    componentDidUpdate() {
        // get the messagelist container and set the scrollTop to the height of the container
        const objDiv = document.getElementById("messageList");
        objDiv.scrollTop = objDiv.scrollHeight;
    }

    render() {
        // Loop through all the messages in the state and create a Message component
        const messages = this.props.messages.map((message, i) => {
            return (
                <Message
                    key={i}
                    username={message.username}
                    message={message.message}
                    fromMe={message.fromMe}
                />
            );
        });

        return (
            <div className="messages" id="messageList">
                {messages}
                <style jsx>{`
                    .messages {
                        overflow-y: scroll;
                        overflow-x: hidden;
                        flex-grow: 1;
                        padding: 20px;
                        grid-area: chat-output;
                    }

                    .messages::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        );
    }
}

Messages.defaultProps = {
    messages: []
};

export default Messages;
