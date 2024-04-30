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
 // Array de frutas
 const fruits = ['Manzana', 'Plátano', 'Naranja', 'Pera', 'Uva'];

 // Aquí creo el botón de true o falsa
 const [isVisible, setIsVisible] = useState(true);

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
      <ul>
        {fruits.map((fruit, index) => ( // Utilizamos el método map porque los elementos son de tipo JSX (osea dinámicos)
          <li key={index}>{fruit}</li>))}
      </ul>
        
       {/* Cuando clickas te sale contenido */}
       <button onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? 'Ocultar Contenido' : 'Mostrar Contenido'}
      </button>

      {/* para rendirizar o pintar el contenido */}
      {isVisible && (
        <div className="content">
          <h2>Contenido Visible</h2>
          <p>Este es el contenido que se muestra cuando isVisible es true.</p>
        </div>
      )}
    </>)
}


export default GreetingComponent;
