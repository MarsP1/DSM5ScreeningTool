import Database from "@tauri-apps/plugin-sql";

async function Screenings() {
    const db = await Database.load("sqlite:Screenings.db");
    await db.execute("PRAGMA foreign_keys = ON;");

    console.log("test");

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
}

async function addPatient(patientName, dob, mrn) {
    const db = await Database.load("sqlite:Screenings.db");

    mrn = mrn.trim();

    console.log("CHECKING MRN:", JSON.stringify(mrn));

    const exist = await db.select(`
        SELECT patient_id, patient_name, medical_record_num
        FROM patients
        WHERE medical_record_num = $1
    `, [mrn]);

    console.log("FOUND:", exist);

    if (exist.length > 0) {
        console.log("USING EXISTING PATIENT:", exist[0].patient_id);
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
    const db = await Database.load("sqlite:Screenings.db");

    const exist = await db.select(
        `SELECT patient_id
         FROM patients
         WHERE medical_record_num = $1`,
        [mrn]
    );

    if (exist.length > 0) {
        return exist[0].patient_id;
    }

    return await addPatient(patientName, dob, mrn);
}

async function screeningRecords(patientId, dos, program, formDataJson, generatedNote) {
    const db = await Database.load("sqlite:Screenings.db");

    await db.execute(`
        insert into screening_records
        (patient_id, date_of_service, program_name, form_data_json, generated_note)
        values ($1, $2, $3, $4, $5)`,
        [patientId, dos, program, formDataJson, generatedNote]
    );
}

async function settings(providerName, clinicName) {
    const db = await Database.load("sqlite:Screenings.db");

    await db.execute(`
        insert into settings
        (provider_name, clinic_name)
        values ($1, $2)`,
        [providerName, clinicName]
    );
}

async function retrieveRecords() {
    const db = await Database.load("sqlite:Screenings.db");

    let patientRecord = await db.select(`
        select
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
            

        from patients
        join screening_records
        on patients.patient_id = screening_records.patient_id
        order by screening_records.date_of_service, record_id DESC
    `);
        

    return patientRecord;
}



export {Screenings, addPatient, findPatient, screeningRecords, settings, retrieveRecords};

