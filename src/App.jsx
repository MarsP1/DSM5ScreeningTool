import { BrowserRouter, Routes, Route } from "react-router-dom";

import { Screenings } from "./ScreeningsDB.jsx";

import Interface from "./Pages/Interface.jsx";
import Screener from "./Pages/Screener.jsx";
import PreScreener from "./Pages/PreScreener.jsx";
import Records from "./Pages/Records.jsx";
import Patient from "./Pages/Patient.jsx"


import "./CSS/App.css";
import "./CSS/Page.css";

function App() {
    Screenings();
  return (

    <BrowserRouter>
      
      <Routes>
        <Route path="/" element={<Interface />} />
        <Route path="/Screener" element={<Screener />} />
        <Route path="/PreScreener" element={<PreScreener />} />
        <Route path="/Records" element={<Records />} />
        <Route path="/patient/:patientId" element={<Patient />} />
      </Routes>


    </BrowserRouter>
  );
}

export default App;
