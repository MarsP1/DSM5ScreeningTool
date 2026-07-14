import { BrowserRouter, Routes, Route } from "react-router-dom";

import ScreeningInterface from "./Pages/ScreeningInterface.jsx";
import Screener from "./Pages/Screening.jsx";
import PreScreener from "./Pages/PreScreening.jsx";

import "./CSS/App.css";

function App() {

  return (
    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<ScreeningInterface />} />
        <Route path="/Screener" element={<Screener />} />
        <Route path="/PreScreener" element={<PreScreener />} />
      </Routes>


    </BrowserRouter>
  );
}

export default App;
