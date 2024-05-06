
import { useState } from 'react'; // Solo importa useState desde 'react'
import './App.css';
import Title from './Title';
import SubTitle from './SubTitle';
import Image from './Image';
import Paragraph from './Paragraph';

import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Title /> {/* Renderiza el componente Title */}
      <SubTitle /> {/* Renderiza el componente SubTitle */}
      <Image /> {/* Renderiza el componente Image */}
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <Paragraph /> {/* Renderiza el componente Paragraph */}
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
