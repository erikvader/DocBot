// This component is where the user can type their message and send it
// to the chat room. We shouldn't communicate with the server here though.
class ChatInput extends React.Component {
    constructor(props) {
        super(props);
        // Set initial state of the chatInput so that it is not undefined
        this.state = {chatInput: ""};
        // React ES6 does not bind 'this' to event handlers by default
        this.submitHandler = this.submitHandler.bind(this);
        this.textChangeHandler = this.textChangeHandler.bind(this);
    }

    textChangeHandler(event) {
        this.setState({chatInput: event.target.value});
    }

    submitHandler(event) {
        // Stop the form from refreshing the page on submit
        event.preventDefault();
        // Call the onSend callback with the chatInput message
        this.props.onSend(this.state.chatInput);
        // Clear the input box
        this.setState({chatInput: ""});
    }

    render() {
        return (
            <div className="chat-wrap">
                <form className="chat-form" onSubmit={this.submitHandler}>
                    <input
                        type="text"
                        onChange={this.textChangeHandler}
                        value={this.state.chatInput}
                        placeholder="Write a message..."
                        required
                    />
                </form>
                <style jsx>{`
                    .chat-form {
                        text-align: center;
                    }
                    .chat-form input[type="text"] {
                        width: 100%;
                    }
                    input[type="text"] {
                        display: inline-block;
                        height: 60px;
                        -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
                        -moz-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
                        color: #1e1e1e;
                        font: 400 1rem "proxima-nova", sans-serif;
                        border: 1px solid #dee0e0;
                        -webkit-transition: border-color 0.2s ease-in-out;
                        -moz-transition: border-color 0.2s ease-in-out;
                        transition: border-color 0.2s ease-in-out;
                        text-indent: 15px;
                        border-radius: 10px;
                    }
                    input[type="text"]:focus {
                        border: 1px solid #ff4a4a;
                        outline: none !important;
                    }
                `}</style>
            </div>
        );
    }
}

ChatInput.defaultProps = {};

export default ChatInput;
