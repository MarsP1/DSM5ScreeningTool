import Database from "@tauri-apps/plugin-sql";

async function addPatient() {
    const db = await Database.load("sqlite:Screenings.db");

    await db.execute(`
        insert into patients 
        (patient_name, date_of_birth, medical_record_num) 
        values ($1, $2, $3)
        `,
        ["John Doe", "12/13/2000", "12345"]
    );


}

