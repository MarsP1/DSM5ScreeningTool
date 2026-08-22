import InterfacePanel from "../Components/InterfacePanel.jsx";
import { useEffect } from "react";
import { Screenings, addPatient, findPatient, screeningRecords, settings } from "../ScreeningsDB";


function Screener() {
   useEffect(() => {
      async function receive(event) {
            console.log(event.data);
           const patientId = await findPatient(
              event.data.patientName,
              event.data.dob,
              event.data.mrn
            );
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
          src="/Screening.html" 
          className="Screener"  
        />
      </div>
      
    </div>
  );
}

export default Screener;