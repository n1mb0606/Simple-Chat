import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'
import{ 
    Button,
    InputGroup,
    FormControl,
    Form,
    Container,
    Col,
    Row,
    Tabs,
    Tab,
    Alert,
    ListGroup,
    Card
} from 'react-bootstrap'
import CardHeader from 'react-bootstrap/esm/CardHeader';
import socket from '../socket';
const crypto  = require('crypto');

class MessageArea extends React.Component{
  constructor(props){
    super(props);
    this.SubmitMessages = this.SubmitMessages.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.AddMessage = this.AddMessage.bind(this);
    this.state = {msg: '', message_list: []}
  }
  componentDidMount(){
    socket.on('chat_message', (msg_obj) => {
      this.setState((state) => {
        return { message_list: state.message_list.concat([msg_obj])};
      });
      let obj = document.getElementById('imessage_box');
      obj.scrollTop = obj.scrollHeight;
    });
  }
  
  SubmitMessages(event){
    console.log(this.state.message_list)
    event.preventDefault();
    if(this.state.msg){
      socket.emit('chat_message', this.state.msg);
    }
    this.setState({msg: ''});
    console.log(this.state.message_list)
  }
  AddMessage(e) {
    console.log(e);
  }
  handleChange(event){
    this.setState({msg: event.target.value});
  }
  render(){
    const messageDisplay= [];
    let idx = 0;
    let sflag = 0;

    if(this.state.message_list.length){
      while(true){
        var styleTag = (this.state.message_list[idx].id ==  crypto.createHash('sha512').update(socket.id).digest('hex')
                        ? "from-me" : "from-them");
        if(idx >= (this.state.message_list.length - 1)){
          if(idx == sflag){
            messageDisplay.push(<span className={styleTag}>{this.state.message_list[idx].name}</span>);
          }
          else{
            styleTag += " no-tail";
          }
          messageDisplay.push(<p className={styleTag}>{this.state.message_list[idx].message}</p>)
          break;
        }
        if(idx == sflag){
          messageDisplay.push(<span className={styleTag}>{this.state.message_list[idx].name}</span>);
        }
        else{
          styleTag += " no-tail";
        }
        if(this.state.message_list[idx].id != this.state.message_list[idx + 1].id){
          sflag = idx + 1;
        }
        else{
          styleTag += " margin-b_none"
        }
        messageDisplay.push(<p className={styleTag}>{this.state.message_list[idx].message}</p>)
        idx++;
      }
  }
    return(
      <div className="messages_wrapper">
        <div className="messages">
          <div id="imessage_box" class="imessage">
          {messageDisplay}
    
          </div>
          <Form className="form" onSubmit={this.SubmitMessages}>
            <InputGroup>
              <Form.Control type="text" value={this.state.msg} onChange={this.handleChange} autoComplete="off"/>
              <Button type="submit">Send</Button>
            </InputGroup>
          </Form>  
        </div>
      </div>
    );
  }
}
class UserList extends React.Component{
  constructor(props){
    super(props);
    this.state = { user_list: []}
  }
  componentDidMount() {
    socket.on('user_list', (userList) => {
      this.setState({user_list: userList});
    });
  }
  render(){
    const renderedUserList = this.state.user_list.map((user) => {
      return (<ListGroup.Item>{user}</ListGroup.Item>);
    })
    return(
      <div className="user-list">
        <Card>
        <CardHeader>User List</CardHeader>
        <div className="user-list-users">
          <ListGroup>
            {renderedUserList}
          </ListGroup>
        </div>
        </Card>
      </div>
    );
  }
}
class ChatMain extends React.Component{
  render(){
    return(
      <div className="chat-main">
        <UserList />
        <MessageArea />
      </div>
    ); 
  }
}
export default ChatMain;