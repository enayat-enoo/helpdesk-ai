# 🧠 Helpdesk AI

A modern AI-powered helpdesk platform with agent automation, ticketing, and knowledge base.

---

## 📐 Architecture Diagram & Rationale

```
[Frontend (React)] <-> [Express API] <-> [MongoDB]
                             |
                        [Agent Service]
```

- **Frontend:** React SPA for user, agent, and admin interfaces.
- **Express API:** RESTful backend for authentication, ticketing, KB, config, and agent endpoints.
- **MongoDB:** Stores users, tickets, KB articles, config, and audit logs.
- **Agent Service:** Handles AI agent planning, prompt orchestration, and tool execution.

**Rationale:**  
Separation of concerns enables scalable development, easy testing, and future extensibility (e.g., swap agent model, add tools).

---

## 🚀 Setup & Run Instructions

### 1. **Environment Variables**

Create a `.env` file in `server/`:

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=change-me
STUB_MODE=true
AUTO_CLOSE_ENABLED=true
CONFIDENCE_THRESHOLD=0.78
```

### 2. **Docker (Optional)**

To run with Docker Compose:

```bash
docker-compose up --build
```

### 3. **Seed Database**

To seed initial KB articles and users:

```bash
node server/seed.js
```

### 4. **Run Locally**

```bash
# Install dependencies
cd server
npm install

# Start backend
npm start

# In another terminal, start frontend
cd ../client
npm install
npm start
```

---

## 🤖 How Agent Works

### **Plan**

- Receives ticket context and user query.
- Uses LLM (e.g., OpenAI) to generate a plan: steps, tools, and expected outcomes.

### **Prompts**

- System prompt: Defines agent persona, rules, and available tools.
- User prompt: Ticket details and user message.
- Tool prompts: For KB search, ticket update, etc.

### **Tools**

- **KB Search:** Finds relevant articles.
- **Ticket Update:** Modifies ticket status or fields.
- **Audit Log:** Records agent actions.

### **Guardrails**

- Role-based access enforced via middleware.
- Agent actions validated before execution.
- Prompts sanitized to prevent prompt injection.
- All agent actions logged for audit.

---

## 🧪 Testing Instructions & Coverage

### **Run Tests**

```bash
cd server
npm test
```


