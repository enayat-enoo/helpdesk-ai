# 🧠 Helpdesk AI

A modern AI-powered helpdesk platform with agent automation, ticketing, and knowledge base management. Built with MERN stack and designed to meet the **Smart Helpdesk with Agentic Triage** assignment requirements.

---

## 📐 Architecture Diagram & Rationale

```
[Frontend (React + Vite + Tailwind)] <-> [Express API (Node.js)] <-> [MongoDB]
                                                 |
                                          [Agent Service]
```

* **Frontend:** React SPA with role-based dashboards for Users, Agents, and Admins.
* **Express API:** RESTful backend handling authentication, tickets, KB, config, audit logs, and agent endpoints.
* **MongoDB:** Stores users, tickets, KB articles, audit logs, and config.
* **Agent Service:** Implements agentic workflow (plan → classify → retrieve KB → draft → decide → log).

**Rationale:**

* Clear separation of concerns for scalability and testing.
* Agent service abstracted so we can plug in real LLMs or a deterministic stub.
* Docker-based for easy local development and reproducibility.

---

## 🚀 Setup & Run Instructions

### 1. Environment Variables

Create a `.env` file inside the `server/` directory:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=change-me
STUB_MODE=true
AUTO_CLOSE_ENABLED=true
CONFIDENCE_THRESHOLD=0.78
```

### 2. Docker Setup

Run the entire stack with Docker Compose:

```bash
docker-compose up --build
```

### 3. Local Development

Run backend:

```bash
cd server
npm install
npm run dev
```

Run frontend:

```bash
cd client
npm install
npm run dev
```

### 4. Seed Database

Seed users, KB articles, and tickets:

```bash
node server/seed.js
```

---

## ⚙️ Agent Workflow

1. **Plan**: A simple state machine determines steps for a new ticket.
2. **Classify**: Stub-based classifier detects category (billing, tech, shipping, other) using keywords and outputs confidence.
3. **Retrieve KB**: Simple keyword search (regex) over KB articles to fetch top 3 matches.
4. **Draft Reply**: Drafts a templated response with citations to KB articles.
5. **Decision**: If auto-close is enabled and confidence ≥ threshold → auto-resolve; otherwise assign to a human.
6. **Logging**: Every step appends an AuditLog with consistent `traceId`.

**Stub Mode:**

* Works fully without external LLM keys.
* Classification is keyword-based.
* Draft reply is a simple template insertion of KB titles.

---

## 📚 API Endpoints

### Auth

* `POST /api/auth/register` → Register new user
* `POST /api/auth/login` → Login and return JWT

### Knowledge Base (KB)

* `GET /api/kb?query=...` → Search KB
* `POST /api/kb` (Admin)
* `PUT /api/kb/:id` (Admin)
* `DELETE /api/kb/:id` (Admin)

### Tickets

* `POST /api/tickets` (User)
* `GET /api/tickets` → Filter by status/my tickets
* `GET /api/tickets/:id`
* `POST /api/tickets/:id/reply` (Agent)
* `POST /api/tickets/:id/assign` (Admin/Agent)

### Agent

* `POST /api/agent/triage` → Trigger triage
* `GET /api/agent/suggestion/:ticketId`

### Config

* `GET /api/config`
* `PUT /api/config` (Admin)

### Audit

* `GET /api/tickets/:id/audit`

---

## 🖥️ Frontend Pages

* **Login / Register**
* **Tickets Dashboard** (User & Agent)
* **Ticket Detail** (conversation + AI draft + audit timeline)
* **KB Management** (Admin CRUD)
* **Settings** (Admin config)

Features:

* Role-based navigation
* Loading skeletons & error states
* Responsive design with Tailwind
* Validation & accessible components

---

## 🔒 Security & Reliability

* JWT with expiry
* Input validation (Joi/Zod)
* Rate limiting on auth endpoints
* CORS configured narrowly
* No secrets logged
* Agent calls have timeouts & retries

---

## 📊 Observability

* JSON logs with `traceId` and `ticketId`
* Request logging middleware
* `/healthz` and `/readyz` endpoints

---

## 🛠️ Testing

### Backend (Jest)

* Auth (register/login)
* KB search
* Ticket creation
* Agent triage decision
* Audit logging

### Frontend (Vitest + RTL)

* Form validation
* Rendering role-based dashboards
* KB editor interactions

Run tests:

```bash
cd server && npm test
cd client && npm test
```

---

## 🚀 Hints & Gotchas (for reviewers)

* Prompts & stub rules versioned in code
* Audit log is immutable
* Timezones handled in ISO format
* Designed for extension: real LLM can replace stub without code changes
