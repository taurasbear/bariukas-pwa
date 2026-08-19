import { useState } from "react";
import "./App.css";
import reactLogo from "./assets/react.svg";
import { Button } from "./components/ui/button.tsx";
import { Card } from "./components/ui/card.tsx";
import PWABadge from "./PWABadge.tsx";
import appLogo from "/favicon.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className="logo" alt="bariukas logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1 className="bg-red-500">bariukas</h1>
      <div className="card">
        <Card className="bg-primary">Wow</Card>
        <Button className="bg-secondary">Super!!</Button>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <PWABadge />
    </>
  );
}

export default App;
