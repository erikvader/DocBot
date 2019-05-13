// This component displays an individual message.
class Message extends React.Component {
    render() {
        // Was the message sent by the current user. If so, add a css class
        const fromMe = this.props.fromMe ? "from-me" : "";
        return (
            <div className={`message ${fromMe}`}>
                <div className="username">{this.props.username}</div>
                <div className="message-body">{this.props.message}</div>
                <style jsx>{`
                    .message.from-me .username {
                        display: none;
                    }
                    .message.from-me {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 5px;
                    }
                    .message.from-me .message-body {
                        background-color: #ff4a4a;
                        color: white;
                    }
                    .message {
                        margin-bottom: 20px;
                    }
                    .message-body {
                        max-width: 80%;
                        display: inline-block;
                        padding: 10px 12px;
                        background-color: #eee;
                        border: 1px;
                        border-radius: 5px;
                    }
                    .username {
                        font-weight: bold;
                        font-size: 0.9rem;
                        color: #999;
                        margin-bottom: 5px;
                    }
                `}</style>
            </div>
        );
    }
}

Message.defaultProps = {};

export default Message;
