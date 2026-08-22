import InterfacePanel from "../Components/InterfacePanel.jsx";

import { useEffect } from "react";
import { Screenings, addPatient, findPatient, screeningRecords, settings } from "../ScreeningsDB.jsx";
//import "../CSS/Page.css";


function PreScreener() {
   useEffect(() => {
      async function receive(event) {

           const patientId = await findPatient(
              event.data.patientName,
              event.data.dob,
              event.data.mrn
            );
            console.log("PATIENT ID RETURNED TO RECEIVE:", patientId);
            await screeningRecords(
              patientId,
              event.data.dos,
              event.data.program,
              event.data.formDataJson,
              event.data.generatedNote
            );

            await settings(
              event.data.providerName,
              event.data.clinicName
            )
            
            console.log("Saved");
          } 
          window.addEventListener("message", receive);

        return () => {
            window.removeEventListener("message", receive);
          };
    }, []);

  return (
    <div className="page">
      <InterfacePanel/>
      <div className="pageContent">
        <iframe 
          src="/PreScreening.html" 
          className="PreScreener"
          
        />
      </div>
        
  
    </div>
  );
}

export default PreScreener;