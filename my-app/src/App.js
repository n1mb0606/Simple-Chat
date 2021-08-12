import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  StaticRouter,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom"
import ChatMain from './component/MainPage';
import LoginPage from './component/LoginPage'

class Login extends React.Component{
  constructor(props){
    super(props);
    this.checkLoginstate = this.checkLoginstate.bind(this);
    this.state = {chklogin: false};
  }
  checkLoginstate(){
    this.setState({chklogin: true});
  }
  name 
  render(){
    return(
      this.state.chklogin ?
        <Redirect to="/chat"/>
        :<LoginPage loginChecker={this.checkLoginstate}/>
      );
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
            <Login />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;