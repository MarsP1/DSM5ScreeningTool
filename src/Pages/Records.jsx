import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { retrieveRecords } from "../ScreeningsDB.jsx";

import InterfacePanel from "../Components/InterfacePanel.jsx";
import "../CSS/Records.css";

function records() {
    const [records, setRecords] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function loadRecords() {
            const data = await retrieveRecords();
            setRecords(data);
        }

        loadRecords();
    }, []);

    return (
        <div className="page">
            <InterfacePanel />

            <div className="recordsContent">

                <input
                    className="patientSearch"
                    type="text"
                    placeholder="Search by name, MRN, or date of birth..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <div className="tableContainer">
                    <table className="table">
                        <thead>
                            <tr className="tableHeadings">
                                <th>MRN</th>
                                <th>Patient Name</th>
                                <th>Date of Birth</th>
                                <th>Date of Service</th>
                            </tr>
                        </thead>

                        <tbody className="tableData">
                            {records
                                .filter(
                                    (record, index, self) =>
                                        index ===
                                        self.findIndex(
                                            r =>
                                                r.patient_id ===
                                                record.patient_id
                                        )
                                )
                                .filter(record =>
                                    record.patient_name
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) ||
                                    record.medical_record_num
                                        .toLowerCase()
                                        .includes(search.toLowerCase()) ||
                                    record.date_of_birth.includes(search)
                                )
                                .map(record => (
                                    <tr key={record.patient_id}>
                                        <td>{record.medical_record_num}</td>

                                        <td>
                                            <Link
                                                to={`/patient/${record.patient_id}`}
                                                className="patientLink"
                                            >
                                                {record.patient_name}
                                            </Link>
                                        </td>

                                        <td>{record.date_of_birth}</td>
                                        <td>{record.date_of_service}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
export default records;