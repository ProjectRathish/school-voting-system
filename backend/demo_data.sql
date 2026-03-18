-- DEMO DATA FOR SCHOOL VOTING SYSTEM --
-- Use this to populate your database for testing --

-- 1. Create a School
INSERT INTO schools (name, code, location) 
VALUES ('St. Patrick Academy', 'SPA001', 'Green Valley, CA');
SET @school_id = LAST_INSERT_ID();

-- 2. Create a School Admin User (Password: pass123)
-- Hash generated for 'pass123'
INSERT INTO users (school_id, username, password_hash, role, must_change_password)
VALUES (@school_id, 'admin', '$2b$10$pm64o3Ij..sueQM4Q/nvWOeUEnD0k1I.7MkYDSsENudKI./r9qaam', 'SCHOOL_ADMIN', 0);
SET @admin_id = LAST_INSERT_ID();

-- 3. Create an Election
INSERT INTO elections (school_id, name, status, created_by)
VALUES (@school_id, 'Student Council Election 2026', 'CONFIGURING', @admin_id);
SET @election_id = LAST_INSERT_ID();

-- 4. Create Sections and Classes
INSERT INTO sections (school_id, election_id, name) VALUES (@school_id, @election_id, 'Secondary');
SET @section_id = LAST_INSERT_ID();

INSERT INTO classes (school_id, election_id, section_id, name) VALUES (@school_id, @election_id, @section_id, 'Grade 10-A');
SET @class_10a_id = LAST_INSERT_ID();

INSERT INTO classes (school_id, election_id, section_id, name) VALUES (@school_id, @election_id, @section_id, 'Grade 12-A');
SET @class_12a_id = LAST_INSERT_ID();

-- 5. Create Posts
-- Head Boy (Eligible: Grade 12-A, MALE)
INSERT INTO posts (school_id, election_id, name, gender_rule, candidate_classes, voting_classes)
VALUES (@school_id, @election_id, 'Head Boy', 'M', 
        JSON_ARRAY(@class_12a_id), 
        JSON_ARRAY(@class_10a_id, @class_12a_id));
SET @post_hb_id = LAST_INSERT_ID();

-- Head Girl (Eligible: Grade 12-A, FEMALE)
INSERT INTO posts (school_id, election_id, name, gender_rule, candidate_classes, voting_classes)
VALUES (@school_id, @election_id, 'Head Girl', 'F', 
        JSON_ARRAY(@class_12a_id), 
        JSON_ARRAY(@class_10a_id, @class_12a_id));
SET @post_hg_id = LAST_INSERT_ID();

-- 6. Create Voters (Students)
INSERT INTO voters (school_id, election_id, admission_no, name, class_id, sex, is_active)
VALUES (@school_id, @election_id, 'ADM1001', 'John Doe', @class_12a_id, 'M', 1);
SET @voter_john_id = LAST_INSERT_ID();

INSERT INTO voters (school_id, election_id, admission_no, name, class_id, sex, is_active)
VALUES (@school_id, @election_id, 'ADM1002', 'Mike Ross', @class_12a_id, 'M', 1);
SET @voter_mike_id = LAST_INSERT_ID();

INSERT INTO voters (school_id, election_id, admission_no, name, class_id, sex, is_active)
VALUES (@school_id, @election_id, 'ADM2001', 'Jane Smith', @class_12a_id, 'F', 1);
SET @voter_jane_id = LAST_INSERT_ID();

-- 7. Register Candidates
-- John Doe for Head Boy
INSERT INTO candidates (school_id, election_id, voter_id, post_id)
VALUES (@school_id, @election_id, @voter_john_id, @post_hb_id);

-- Mike Ross for Head Boy
INSERT INTO candidates (school_id, election_id, voter_id, post_id)
VALUES (@school_id, @election_id, @voter_mike_id, @post_hb_id);

-- Jane Smith for Head Girl
INSERT INTO candidates (school_id, election_id, voter_id, post_id)
VALUES (@school_id, @election_id, @voter_jane_id, @post_hg_id);

-- 8. Create a Polling Booth and Officer
INSERT INTO polling_booths (school_id, election_id, booth_number, location)
VALUES (@school_id, @election_id, 'B001', 'Main Auditorium');
SET @booth_id = LAST_INSERT_ID();

-- Booth Officer (Password: pass123)
INSERT INTO users (school_id, username, password_hash, role, must_change_password, booth_id)
VALUES (@school_id, 'officer1', '$2b$10$pm64o3Ij..sueQM4Q/nvWOeUEnD0k1I.7MkYDSsENudKI./r9qaam', 'BOOTH_OFFICER', 0, @booth_id);

-- 9. Create a Voting Machine
INSERT INTO voting_machines (school_id, election_id, booth_id, machine_name, machine_code, machine_token, status)
VALUES (@school_id, @election_id, @booth_id, 'Machine-01', 'M-SPA-001', 'TOKEN_DEMO_001', 'FREE');
