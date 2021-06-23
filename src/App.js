import logo from './logo.svg';
import './App.css';
import EthManager from "./components/EthManager";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <img src={logo} className="App-logo" alt="logo"/>
                <p>
                    Ether Manager
                </p>
            </header>
            <EthManager/>
        </div>
    );
}

export default App;
