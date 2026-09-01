import { useParams } from "react-router-dom";

import { useEffect, useState } from "react";
import { retrieveRecords, deleteScreening  } from "../ScreeningsDB.jsx";

import InterfacePanel from "../Components/InterfacePanel.jsx";
import "../CSS/Patient.css";
import trashBtn from "../assets/trash.svg";

function Patient() {
    const { patientId } = useParams();

    const [records, setRecords] = useState([]);
    const [deleteMode, setDeleteMode] = useState(false);

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

    function printScreening(event) {
        // Find the screening that contains the button
        const screening = event.currentTarget.closest(".screeningRecord");
        screening.classList.add("printingRecord");
        window.print();

        setTimeout(() => {
            screening.classList.remove("printingRecord");
        }, 100);
    }

    async function deleteScreeningPrompt(recordId) {
    const confirmation = window.confirm(
        "Are you sure you want to delete this screening?"
    );

    if (!confirmation) {
        return;
    }

    await deleteScreening(recordId);

    setRecords(currentRecords =>
        currentRecords.filter(record => record.record_id !== recordId)
    );

    setDeleteMode(false);
}

    return (
        <div className="patientPage">
            <InterfacePanel />
            <button className={`deleteScreeningBtn ${deleteMode ? "deleteActive" : ""}`}
                onClick={() => {
                    setDeleteMode(!deleteMode);
                }}>
                <img src={trashBtn}/>
                
            </button>

            <div className="patientContainer">

                <div className="basicInfo patientPrintInfo">

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

                        <details className={`screeningRecord ${deleteMode ? "deleteScreeningMode" : ""}`}
                            key={record.record_id ?? index}
                            onClick={(e) => {
                            if (deleteMode) {
                                e.preventDefault();
                                e.stopPropagation();
                                deleteScreeningPrompt(record.record_id);
                            }
                        }}
                        >

                            <summary className="recordSummary">

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

                                <button
                                    className="printButton"
                                    onClick={printScreening}
                                >Print Screening
                                </button>

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
                                        {new Date(
                                            record.created_at + "Z"
                                        ).toLocaleTimeString([], {
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </p>

                                </div>

                                <details className="formData">

                                    <summary>
                                        <strong>Form Data</strong>
                                    </summary>

                                    <pre>
                                        {JSON.stringify(
                                            JSON.parse(record.form_data_json),
                                            null,
                                            2
                                        )}
                                    </pre>

                                </details>

                                <div className="generatedNote">
                                    <h3>Generated Note</h3>

                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: record.generated_note
                                        }}
                                    />

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