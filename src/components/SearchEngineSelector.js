import React, { useState } from 'react';
import './SearchEngineSelector.css';

const SearchEngineSelector = () => {
  const [selectedEngine, setSelectedEngine] = useState('baidu');

  const searchEngines = {
    baidu: { name: '百度', url: 'https://www.baidu.com' },
    bing: { name: 'Bing', url: 'https://www.bing.com' },
    google: { name: 'Google', url: 'https://www.google.com' },
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com' },
    yahoo: { name: 'Yahoo', url: 'https://www.yahoo.com' }
  };

  const handleEngineChange = (event) => {
    setSelectedEngine(event.target.value);
  };

  const handleGoClick = () => {
    window.open(searchEngines[selectedEngine].url, '_blank');
  };

  return (
    <div className="search-engine-selector">
      <h2>选择搜索引擎</h2>
      <div className="selector-container">
        <select 
          value={selectedEngine} 
          onChange={handleEngineChange}
          className="engine-dropdown"
        >
          {Object.entries(searchEngines).map(([key, engine]) => (
            <option key={key} value={key}>
              {engine.name}
            </option>
          ))}
        </select>
        <button onClick={handleGoClick} className="go-button">
          Go
        </button>
      </div>
    </div>
  );
};

export default SearchEngineSelector;
