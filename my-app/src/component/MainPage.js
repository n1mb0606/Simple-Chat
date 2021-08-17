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
      socket.on('chat_message', function(msg_obj, self) {
        console.log(self);
        var item_name = document.createElement('li');
        var item_message = document.createElement('li');
        if(self){
          item_name.setAttribute('align', 'right');
          item_message.setAttribute('align', 'right');
        }
        item_name.textContent = msg_obj.name+': ';
        item_message.textContent = msg_obj.message;

        document.getElementById('messages').appendChild(item_name);
        document.getElementById('messages').appendChild(item_message);
        window.scrollTo(0, document.body.scrollHeight);
    });
  }
  SubmitMessages(event){
    event.preventDefault();
    if(this.state.msg){
      socket.emit('chat_message', this.state.msg);
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