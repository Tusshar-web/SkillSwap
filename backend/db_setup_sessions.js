require('dotenv').config();
const db = require('./config/db');

async function createTable() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS sessions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                request_id INT,
                partner_1_id INT NOT NULL,
                partner_2_id INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                scheduled_date DATE NOT NULL,
                scheduled_time TIME NOT NULL,
                timezone VARCHAR(50) DEFAULT 'GMT+1',
                partner_1_completed BOOLEAN DEFAULT FALSE,
                partner_2_completed BOOLEAN DEFAULT FALSE,
                status ENUM('upcoming', 'completed', 'cancelled') DEFAULT 'upcoming',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (partner_1_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (partner_2_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log("Sessions table created successfully.");
    } catch (e) {
        console.error("Error creating table:", e);
    } finally {
        process.exit();
    }
}
createTable();
