import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const GreetingComponent = () => {
  const [count, setCount] = useState(0);
  const determineGreeting = (count) => {
    if(count===23){  //aquí le doy intervalo máximo como si fuesen las horas del día
      setCount(0); 
    }
    if (count >= 6 && count < 13) {
      return 'Buenos días';
    } else if (count >12 && count < 20) {
      return 'Buenas tardes';
    } else {
      return 'Buenas noches';
    }
  };

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img
            src={viteLogo}
            className="logo"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      {console.log("cuenta dentro",count)/*para que me lea el tramo por consola */}
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          Incrementar contador
        </button>
        <p>
          {determineGreeting(count)}
        </p>
      </div>
      <p className="read-the-docs">
        Click en los logotipos de Vite y React para aprender más
      </p>
    </>
  );
};

export default GreetingComponent;
