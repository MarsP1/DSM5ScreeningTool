import Database from "@tauri-apps/plugin-sql";

let dbPromise = null;

async function getDB() {
    if (!dbPromise) {
        dbPromise = Database.load("sqlite:Screenings.db");
    }

    return await dbPromise;
}


async function Screenings() {

    const db = await getDB();

    await db.execute("PRAGMA foreign_keys = ON;");

    console.log("SQLite initialized");

    await db.execute(`
        create table if not exists patients (
            patient_id integer primary key autoincrement,
            patient_name text not null,
            date_of_birth text not null,
            medical_record_num text unique,
            created_at text default current_timestamp
        )
    `);

    await db.execute(`
        create table if not exists screening_records (
            record_id integer primary key autoincrement,
            patient_id integer references patients(patient_id),
            program_name text not null,
            date_of_service text not null,
            form_data_json text,
            generated_note text,
            created_at text default current_timestamp
        )
    `);

    await db.execute(`
        create table if not exists settings (
            id integer primary key autoincrement,
            provider_name text,
            clinic_name text
        )
    `);

    console.log("Database tables initialized");
}


async function addPatient(patientName, dob, mrn) {

    const db = await getDB();

    mrn = mrn.trim();

    console.log("CHECKING MRN:", JSON.stringify(mrn));

    const exist = await db.select(`
        SELECT patient_id, patient_name, medical_record_num
        FROM patients
        WHERE medical_record_num = $1
    `, [mrn]);

    console.log("FOUND:", exist);

    if (exist.length > 0) {

        console.log(
            "USING EXISTING PATIENT:",
            exist[0].patient_id
        );

        return exist[0].patient_id;
    }

    const info = await db.execute(`
        INSERT INTO patients
        (patient_name, date_of_birth, medical_record_num)
        VALUES ($1, $2, $3)
    `, [patientName, dob, mrn]);

    console.log("NEW PATIENT:", info.lastInsertId);

    return info.lastInsertId;
}


async function findPatient(patientName, dob, mrn) {

    const db = await getDB();

    const exist = await db.select(
        `SELECT patient_id
         FROM patients
         WHERE medical_record_num = $1`,
        [mrn]
    );

    if (exist.length > 0) {
        return exist[0].patient_id;
    }

    return await addPatient(
        patientName,
        dob,
        mrn
    );
}


async function screeningRecords(
    patientId,
    dos,
    program,
    formDataJson,
    generatedNote
) {

    const db = await getDB();

    const result = await db.execute(`
        INSERT INTO screening_records
        (
            patient_id,
            date_of_service,
            program_name,
            form_data_json,
            generated_note
        )
        VALUES ($1, $2, $3, $4, $5)
    `,
    [
        patientId,
        dos,
        program,
        formDataJson,
        generatedNote
    ]);

    console.log(
        "Screening record saved:",
        result.lastInsertId
    );

    return result.lastInsertId;
}


async function settings(providerName, clinicName) {

    const db = await getDB();

    await db.execute(`
        INSERT INTO settings
        (
            provider_name,
            clinic_name
        )
        VALUES ($1, $2)
    `,
    [
        providerName,
        clinicName
    ]);
}


async function retrieveRecords() {

    const db = await getDB();

    const patientRecord = await db.select(`
        SELECT
            patients.patient_id,
            medical_record_num,
            patient_name,
            date_of_birth,

            record_id,
            program_name,
            date_of_service,
            form_data_json,
            generated_note,
            screening_records.created_at

        FROM patients

        JOIN screening_records
        ON patients.patient_id = screening_records.patient_id

        ORDER BY screening_records.created_at DESC
    `);

    return patientRecord;
}


async function deletePatient(patientId) {

    const db = await getDB();

    await db.execute(
        "DELETE FROM screening_records WHERE patient_id = $1",
        [patientId]
    );

    await db.execute(
        "DELETE FROM patients WHERE patient_id = $1",
        [patientId]
    );
}


async function deleteScreening(recordId) {

    const db = await getDB();

    await db.execute(
        "DELETE FROM screening_records WHERE record_id = $1",
        [recordId]
    );
}

async function getFormattedRecords() {

    const records = await retrieveRecords();

    return records.map(record => ({
        id: record.record_id,
        patientName: record.patient_name,
        dob: record.date_of_birth,
        mrn: record.medical_record_num,
        program: record.program_name,
        dos: record.date_of_service,
        formDataJson: record.form_data_json,
        generatedNote: record.generated_note,
        savedAt: record.created_at
    }));
}

function setupArnOfficeBridge() {

    async function handleMessage(event) {

        const message = event.data;

        if (!message || typeof message !== "object") {
            return;
        }

        if (message.type === "ARNP_GET_RECORDS") {

            try {

                console.log(
                    "ARNP iframe requested records"
                );

                const records = await retrieveRecords();

                console.log(
                    "Records retrieved from SQLite:",
                    records
                );

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: records.map(record => ({
                            id: record.record_id,
                            patientName: record.patient_name,
                            dob: record.date_of_birth,
                            mrn: record.medical_record_num,
                            program: record.program_name,
                            dos: record.date_of_service,
                            formDataJson: record.form_data_json,
                            generatedNote: record.generated_note,
                            savedAt: record.created_at
                        }))
                    },
                    "*"
                );

            } catch (error) {

                console.error(
                    "Failed to retrieve SQLite records:",
                    error
                );

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: [],
                        error: error.message
                    },
                    "*"
                );
            }

            return;
        }

        if (message.type === "ARNP_DELETE_RECORD") {

            try {

                console.log(
                    "Deleting record:",
                    message.recordId
                );

                await deleteScreening(
                    message.recordId
                );

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: await getFormattedRecords()
                    },
                    "*"
                );

            } catch (error) {

                console.error(
                    "Failed to delete record:",
                    error
                );

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: [],
                        error: error.message
                    },
                    "*"
                );
            }

            return;
        }


        if (message.type === "ARNP_DELETE_RECORDS") {

            try {

                console.log(
                    "Deleting record type:",
                    message.recordType
                );

                const records = await retrieveRecords();

                for (const record of records) {

                    const program = String(
                        record.program_name || ""
                    ).toLowerCase();

                    let matches = false;

                    if (message.recordType === "prescreen") {

                        matches =
                            program.includes("pre-screener") ||
                            program.includes("prescreener");

                    } else if (message.recordType === "iq") {

                        matches =
                            program.includes("cog") ||
                            program.includes("iq");

                    } else if (message.recordType === "screener") {

                        const isPrescreen =
                            program.includes("pre-screener") ||
                            program.includes("prescreener");

                        const isIQ =
                            program.includes("cog") ||
                            program.includes("iq");

                        matches =
                            !isPrescreen &&
                            !isIQ;
                    }

                    if (matches) {

                        await deleteScreening(
                            record.record_id
                        );
                    }
                }

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: await getFormattedRecords()
                    },
                    "*"
                );

            } catch (error) {

                console.error(
                    "Failed to delete record type:",
                    error
                );

                event.source.postMessage(
                    {
                        type: "ARNP_RECORDS",
                        requestId: message.requestId,
                        records: [],
                        error: error.message
                    },
                    "*"
                );
            }

            return;
        }


        if (message.type === "ARNP_SAVE_RECORD") {

            try {

                console.log(
                    "Received ARNP save request:",
                    message
                );

                const data = message.payload || message;

                const patientId = await findPatient(
                    data.patientName || "",
                    data.dob || "",
                    data.mrn || ""
                );

                const recordId = await screeningRecords(
                    patientId,
                    data.dos || "",
                    data.program || "Screener Report",
                    data.formDataJson || "",
                    data.generatedNote || ""
                );

                event.source.postMessage(
                    {
                        type: "ARNP_SAVE_RESULT",
                        success: true,
                        recordId: recordId
                    },
                    "*"
                );

                console.log(
                    "ARNP record saved to SQLite"
                );

            } catch (error) {

                console.error(
                    "Failed to save ARNP record:",
                    error
                );

                event.source.postMessage(
                    {
                        type: "ARNP_DB_ERROR",
                        error: error.message
                    },
                    "*"
                );
            }

            return;
        }
    }


    window.addEventListener(
        "message",
        handleMessage
    );


    console.log(
        "ARNP Office bridge initialized"
    );


    return function cleanup() {

        window.removeEventListener(
            "message",
            handleMessage
        );

    };
}

export {
    Screenings,
    addPatient,
    findPatient,
    screeningRecords,
    settings,
    retrieveRecords,
    deletePatient,
    deleteScreening,
    setupArnOfficeBridge
};

