import "./App.css";
import { useState } from "react";
import Nav from "./Nav";
import Content from "./Content";

function App() {
  const [ShowNav, setShowNav] = useState(false);

  const addClass = (event) => {
    setShowNav((current) => !current);
  };

  return (
    <section class="bg">
      <div class={ShowNav ? "show-nav container" : "container"}>
        <div class="circle-container">
          <div class="circle">
            <button id="close" onClick={addClass}>
              <i class="fas fa-times"></i>
            </button>

            <button id="open" onClick={addClass}>
              <i class="fas fa-bars"></i>
            </button>
          </div>
        </div>
        <Content />
      </div>
      <Nav />
    </section>
  );
}

export default App;
