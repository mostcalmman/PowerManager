import logo from './logo.svg';
import './App.css';
import SearchEngineSelector from './components/SearchEngineSelector';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="App-logo-container">
          <img src={logo} className="App-logo" alt="logo" />
          <span className="App-logo-text">Search Engine Selector by React</span>
        </div>
        <p className="App-author">Coded by LSR</p>
        <SearchEngineSelector />
      </header>
    </div>
  );
}

export default App;
