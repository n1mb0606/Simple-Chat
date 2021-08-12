import React from 'react';
import socket from '../socket'

class ChatMain extends React.Component{
  constructor(props){
    super(props);
    this.state = {msg: ''}
    this.SubmitMessages = this.SubmitMessages.bind(this);
    this.handleChange = this.handleChange.bind(this);
    
  }
  componentDidMount(){
      socket.on('chat message', function(msg_obj) {
        var item = document.createElement('li');
        item.textContent = msg_obj.name + ': ' + msg_obj.msg;
        document.getElementById('messages').appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });
  }
  SubmitMessages(event){
    event.preventDefault();
    if(this.state.msg){
      socket.emit('chat message', this.state.msg);
    }
    this.setState({msg: ''});
  }

  handleChange(event){
    this.setState({msg: event.target.value});
  }
  render(){
    return(
      <div>
        <ul id="messages">
          <form id="form" onSubmit={this.SubmitMessages}>
            <input id="input" value={this.state.msg} onChange={this.handleChange} autoComplete="off"/>
            <button type="submit">Send</button>
          </form>
          
        </ul>
      </div>
    );
  }
}

export default ChatMain;