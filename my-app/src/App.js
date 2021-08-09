import 'bootstrap/dist/css/bootstrap.min.css'
import Container from 'react-bootstrap/Container'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'
import './App.css';
import React from 'react';
import io from 'socket.io-client'

var socket = io();

class ChatMain extends React.Component{
  constructor(props){
    super(props);
    this.state = {msg: ''}
    this.SubmitMessages = this.SubmitMessages.bind(this);
    this.handleChange = this.handleChange.bind(this);
    
  }
  componentDidMount(){
      socket.on('chat message', function(msg) {
      var item = document.createElement('li');
      item.textContent = msg;
      document.getElementById('messages').appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
  }
  SubmitMessages(event){
    event.preventDefault();
    if(this.state.msg){
      socket.emit('chat message', this.state.msg);
    }
    
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

function App() {
  return (
    <div>
      <ChatMain />
    </div>
  );
}

export default App;
