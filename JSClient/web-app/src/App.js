import logo from './logo.svg';
import './App.css';
import { Route, Switch, Redirect,BrowserRouter  } from 'react-router-dom';
import Register from "./Register/Register";
import Login from "./Login/Login";
import Home from "./Home/Home";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import ForgotPasswordEmail from "./ForgotPasswordEmail/ForgotPasswordEmail";
import ChangePassword from "./ChangePassword/ChangePassword"
import Lobby from "./Lobby/Lobby";
import Game from "./Game/Game";

function App() {
  return (
    <div>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
       <BrowserRouter>
      <Switch>
      <Route exact path="/Login" component={Login} />
      <Route exact path="/Home" component={Home} />
      <Route exact path="/ChangePassword" component={ChangePassword} />
      <Route exact path="/Lobby" component={Lobby} />
      <Route exact path="/Game" component={Game} />
      <Route exact path="/Register" component={Register} />
      <Route exact path="/ForgotPassword" component={ForgotPassword} />
      <Route exact path="/ForgotPasswordEmail" component={ForgotPasswordEmail} />
      <Route exact path="/">
            <Redirect to="/Login" />
          </Route>      
      </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
