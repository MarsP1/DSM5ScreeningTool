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
            medical_record_num text,
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

