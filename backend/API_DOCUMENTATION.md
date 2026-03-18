# School Voting System APIS Documentation

## Base URL
All API requests must be made to the base URL of your backend. For local development, this is typically:
`http://localhost:3000/api`

## Authentication Overview
Most endpoints require a valid JWT token. Include this token in the `Authorization` header of your requests.
- **Header Format:** `Authorization: Bearer <your_jwt_token>`

Roles used in this system:
- `SCHOOL_ADMIN`: Full access to the school's configurations, elections, and results.
- `BOOTH_OFFICER`: Limited access to assign voters and verify IDs.

---

## 1. Authentication APIs (`/auth`)

### Login (Admin & General Users)
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticates a user and returns a JWT token.
- **Body:**
  ```json
  {
    "school_code": "SCH001",
    "username": "admin_user",
    "password": "secure_password"
  }
  ```
- **Response:** `{ "message": "Login successful", "token": "...", "role": "SCHOOL_ADMIN", "school_id": 1 }`

### Booth Officer Login
- **Endpoint:** `POST /api/auth/booth-login`
- **Description:** Authenticates a Booth Officer for a specific polling booth.
- **Body:**
  ```json
  {
    "school_code": "SCH001",
    "username": "booth1_officer",
    "password": "officer_password"
  }
  ```
- **Response:** `{ "message": "Booth Login successful", "token": "...", "role": "BOOTH_OFFICER", "school_id": 1, "booth_id": 3 }`

### Create Booth Officer (Admin Only)
- **Endpoint:** `POST /api/auth/create-booth-officer`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "username": "booth1_officer",
    "password": "officer_password",
    "booth_id": 1
  }
  ```
- **Response:** `{ "message": "Booth Officer created successfully", "user_id": 14, ... }`

---

## 2. Election Management APIs (`/elections`)

### Create Election (Admin Only)
- **Endpoint:** `POST /api/elections/create`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body:**
  ```json
  {
    "name": "2025 Head Boy and Girl Election",
    "start_time": "2025-04-10 09:00:00",
    "end_time": "2025-04-10 15:00:00"
  }
  ```

### Get Elections
- **Endpoint:** `GET /api/elections`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** Array of election objects for the logged-in school.

### Update Election Status (Admin Only)
- **Endpoint:** `PUT /api/elections/:id/status`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Description:** Allowed statuses: `DRAFT`, `CONFIGURING`, `READY`, `ACTIVE`, `PAUSED`, `CLOSED`.
- **Body (for ACTIVE/PAUSED/READY):** `{ "status": "PAUSED" }`
- **Body (for CLOSED only):**
  ```json
  {
    "status": "CLOSED",
    "confirmation_text": "2025 Head Boy and Girl Election" // Must match exact name
  }
  ```

---

## 3. Voter Management APIs (`/voters`)

### Bulk Upload Voters (Excel)
- **Endpoint:** `POST /api/voters/upload`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Body Type:** `multipart/form-data`
- **Fields:**
  - `file`: The `.xlsx` file containing voters (columns: `admission_no`, `name`, `class`, `sex`).
  - `election_id`: The ID of the election.

### Get Voters
- **Endpoint:** `GET /api/voters/get-voters?election_id=1`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:** Array of voter objects.

---

## 4. Polling Booth APIs (`/polling-booths`)

### Assign Voter to Voting Machine (Booth Officer Only)
- **Endpoint:** `POST /api/polling-booths/assign-voter`
- **Headers:** `Authorization: Bearer <booth_officer_token>`
- **Description:** Verifies student status and instantly locks a free machine for them.
- **Body:**
  ```json
  {
    "admission_no": "4452",
    "election_id": 1
  }
  ```

---

## 5. Voting Machine (EVM) APIs (`/machines`)

### Fetch Ballot (Machine Only)
- **Endpoint:** `GET /api/machines/ballot/fetch`
- **Headers:** `machine-token: <secure_machine_token_string>`
- **Description:** Called automatically by the tablet when unlocked. It strictly returns only the Posts and Candidates the assigned voter is eligible for.
- **Response:** `{ "message": "Ballot retrieved successfully", "voter_id": 44, "ballot": [...] }`

### Cast Vote (Machine Only)
- **Endpoint:** `POST /api/machines/vote/cast`
- **Headers:** `machine-token: <secure_machine_token_string>`
- **Description:** Submits the voter's choices, securely records them, logs demographics, marks the student as `has_voted = 1`, and frees the machine.
- **Body:**
  ```json
  {
    "votes": [
      { "post_id": 1, "candidate_id": 14 },
      { "post_id": 2, "candidate_id": 18 }
    ]
  }
  ```

---

## 6. Results & Analytics APIs (`/elections/:id/results`)
*Note: The election status MUST be `CLOSED` to use these APIs.*

### Basic Results
- **Endpoint:** `GET /api/elections/:id/results`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:** Total voter turnout percentages and standard candidate tallies.

### Advanced Demographics Analytics
- **Endpoint:** `GET /api/elections/:id/detailed-results`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:** Highly detailed breakdowns of candidate votes by Gender (Male/Female), Class, and Section formatting securely for dashboard charting.

### Download Excel Report
- **Endpoint:** `GET /api/elections/:id/export`
- **Headers:** `Authorization: Bearer <admin_token>`
- **Response:** Instantly downloads a styled `.xlsx` file containing the final election tallies for official school records.

---

## 7. WebSockets (Live Connections)
- **URL:** Root server domain (`ws://localhost:3000`)
- **Event to Emit:** `"join_election"` (Payload: `electionID`) -> Joins the live dashboard feed.
- **Event to Listen For:** `"vote_cast"` -> Fired instantly whenever a student submits their ballot. Use this to auto-refresh charts.
