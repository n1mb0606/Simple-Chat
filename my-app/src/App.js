import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css';
import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom"
import ChatMain from './component/MainPage';
import LoginPage from './component/LoginPage'

function App() {
  return (
    <Router>
      <div>
        <Switch>
          <Route path="/chat">
            <ChatMain />
          </Route>
          <Route path="/">
            <LoginPage />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
