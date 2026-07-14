import Database from "@tauri-apps/plugin-sql";

async function testDB() {
    const db = await Database.load("sqlite:test.db");

    console.log("test");

    await db.execute(`
        CREATE TABLE IF NOT EXISTS test (
            id INTEGER PRIMARY KEY,
            message TEXT
        )
    `);
}

testDB();