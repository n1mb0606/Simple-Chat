import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from "react-router-dom"
import ChatMain from './component/MainPage';
import RoomManage from './component/RoomSelect';

class Room extends React.Component{
  constructor(props){
    super(props);
    this.checkRoomselected = this.checkRoomselected.bind(this);
    this.state = {room_selected: false};
  }
  checkRoomselected(){
    this.setState({room_selected: true});
  }
  render(){
    return(
      this.state.room_selected ?
        <Redirect to="/chat" />
        :<RoomManage roomSelecter={this.checkRoomselected} />
    )
  }
}
function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/chat">
            <ChatMain />
          </Route>
          <Route path="/">
            <Room />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;