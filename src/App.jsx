import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {Screenings, setupArnOfficeBridge} from "./ScreeningsDB.jsx";

import Screener from "./Pages/Screener.jsx";

import "./CSS/App.css";


function App() {

    useEffect(() => {
        let cleanup;

        async function initializeApp() {
            try {
                await Screenings();

                cleanup = setupArnOfficeBridge();

                console.log("SQLite and ARNP bridge initialized");
            } catch (error) {
                console.error("Failed to initialize application:", error);
            }
        }

        initializeApp();

        return () => {
            if (cleanup) {
                cleanup();
            }
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
              <Route path="/" element={<Screener />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;



