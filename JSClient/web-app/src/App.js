import logo from './logo.svg';
import './App.css';
import { Route, Switch, Redirect,BrowserRouter  } from 'react-router-dom';
import Register from "./Register/Register";
import Login from "./Login/Login";
import ConfirmPage from "./ConfirmPage/ConfirmPage";
import Home from "./Home/Home";
import ForgotPassword from "./ForgotPassword/ForgotPassword";

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
      <Route exact path="/Register" component={Register} />
      <Route exact path="/ConfirmPage" component={ConfirmPage} />
      <Route exact path="/Home" component={Home} />
      <Route exact path="/ForgotPassword" component={ForgotPassword} />
      <Route exact path="/">
            <Redirect to="/Login" />
          </Route>      
      </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
