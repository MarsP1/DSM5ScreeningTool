import { useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { retrieveRecords } from "../ScreeningsDB.jsx";

import InterfacePanel from "../Components/InterfacePanel.jsx";
import "../CSS/Patient.css";

function Patient() {
    const { patientId } = useParams();

    const [records, setRecords] = useState([]);

    useEffect(() => {
        async function loadRecords() {
            const data = await retrieveRecords();
            setRecords(data);
        }

        loadRecords();
    }, []);

    const patient = records.find(
        record => String(record.patient_id) === String(patientId)
    );

    const patientRecords = records.filter(
        record => String(record.patient_id) === String(patientId)
    );

    return (
        <div className="patientPage">

            <InterfacePanel />

            <div className="patientContainer">

                <div className="basicInfo">

                    <h1>{patient?.patient_name}</h1>

                    <div>
                        <strong>MRN:</strong>{" "}
                        {patient?.medical_record_num}
                    </div>

                    <div>
                        <strong>Date of Birth:</strong>{" "}
                        {patient?.date_of_birth}
                    </div>

                </div>


                <div className="ScreeningInfo">

                    <h2>Screenings</h2>

                    {patientRecords.map((record, index) => (

                        <details
                            className="screeningRecord"
                            key={record.record_id ?? index}
                        >

                            <summary>

                                <div>
                                    <strong>
                                        Screening {patientRecords.length - index}
                                    </strong>

                                    <span>
                                        {record.date_of_service}
                                    </span>
                                </div>

                            </summary>

                            <div className="screeningContent">

                                <div className="screeningDetails">

                                    <p>
                                        <strong>Program: </strong>
                                        {record.program_name}
                                    </p>

                                    <p>
                                        <strong>Date of Service: </strong>
                                        {record.date_of_service}
                                    </p>

                                    <p>
                                        <strong>Created: </strong>
                                        {new Date(record.created_at + "Z").toLocaleTimeString([], {
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </p>

                                </div>

                                <div className="formData">
                                    <h3>Form Data</h3>
                                    <pre>
                                        {JSON.stringify(JSON.parse(record.form_data_json), null, 2)}
                                    </pre>
                                </div>

                                <div className="generatedNote">
                                    <h3>Generated Note</h3>
                                    <div dangerouslySetInnerHTML={{__html: record.generated_note}}/>
                                </div>

                            </div>
                        </details>

                    ))}
                </div>
            </div>
        </div>
    );
}

export default Patient;