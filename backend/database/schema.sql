CREATE DATABASE IF NOT EXISTS bingo_squad_db;

USE bingo_squad_db;


CREATE TABLE IF NOT EXISTS reflections (
    id INT AUTO_INCREMENT PRIMARY KEY,

    user_id INT,

    title VARCHAR(255) NOT NULL,

    project_group VARCHAR(255),

    reflection_date DATE,

    worked_on TEXT,

    challenges TEXT,

    learned TEXT,

    improvement TEXT,

    other_reflection TEXT,

    status VARCHAR(20) DEFAULT 'draft',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS self_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reflection_id INT NOT NULL,

    contribution INT NOT NULL,

    communication INT NOT NULL,

    collaboration INT NOT NULL,

    critical_thinking INT NOT NULL,

    problem_solving INT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (reflection_id)
        REFERENCES reflections(id)
        ON DELETE CASCADE
);



CREATE TABLE IF NOT EXISTS evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reflection_id INT NOT NULL,

    file_name VARCHAR(255) NOT NULL,

    file_type VARCHAR(100),

    file_url VARCHAR(500),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (reflection_id)
        REFERENCES reflections(id)
        ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,

    reflection_id INT NOT NULL,

    assessor_score DECIMAL(5,2),

    feedback TEXT,

    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (reflection_id)
        REFERENCES reflections(id)
        ON DELETE CASCADE
);