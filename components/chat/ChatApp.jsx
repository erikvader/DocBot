//import io from 'socket.io-client';

import Messages from "./Messages";
import ChatInput from "./ChatInput";

class ChatApp extends React.Component {
    //    socket = {};
    constructor(props) {
        super(props);
        this.state = {messages: []};
        this.sendHandler = this.sendHandler.bind(this);

        // Connect to the server
        //this.socket = io(3000, { query: `username=${props.username}` }).connect();

        // Listen for messages from the server
        //this.socket.on('server:message', message => {
        //this.addMessage(message);
        //});
    }

    sendHandler(message) {
        const messageObject = {
            username: this.props.username,
            message
        };

        // Emit the message to the server
        //this.socket.emit('client:message', messageObject);

        messageObject.fromMe = true;
        this.addMessage(messageObject);
    }

    addMessage(message) {
        // Append the message to the component state
        const messages = this.state.messages;
        messages.push(message);
        this.setState({messages});
    }

    render() {
        return (
            <div className="container">
                <h3>Anna Atticus</h3>
                <Messages messages={this.state.messages} />
                <div className="input-wrapper">
                    <ChatInput
                        onSend={this.sendHandler}
                        className="input-wrapper"
                    />
                </div>
                <style jsx>{`
                    .container {
                        display: grid;
                        grid-template-areas:
                            "header header header"
                            "left chat-output right"
                            "left input-wrapper right";
                        grid-template-columns: auto 768px auto;
                        grid-template-rows: 50px auto 80px;
                        height: 100vh;
                    }
                    h3 {
                        text-align: center;
                        background-color: #eee;
                        grid-area: header;
                        padding: 15px 0;
                        margin: 0;
                        border-bottom: 1px solid #ddd;
                    }
                    .chat-output {
                        height: 100%;
                    }
                    .input-wrapper {
                        grid-area: input-wrapper;
                    }
                `}</style>
                <style jsx global>{`
                    body {
                        font-family: "proxima-nova", sans-serif;
                        margin: 0;
                    }
                    html,
                    body,
                    #app,
                    .container {
                        min-height: 100vh;
                        max-height: 100vh;
                        max-width: 100%;
                    }
                `}</style>
            </div>
        );
    }
}

ChatApp.defaultProps = {
    username: "Anonymous"
};

export default ChatApp;
