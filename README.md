# 🌟 Lumina

**Lumina** is a high-performance, real-time social ecosystem designed for sub-millisecond communication and intelligent AI interaction. Unlike traditional chat apps, Lumina leverages a hybrid messaging architecture using **NATS Core**, **NATS JetStream**, and **HTTP Streaming (SSE)** to balance raw speed, guaranteed delivery, and fluid AI UX.

---

## 🚀 Key Features

### 💬 Advanced Real-Time Messaging
* **Hybrid NATS Architecture:** Uses **Core Pub-Sub** for instant chat pings and **JetStream** for durable, persistent notifications (e.g., Friend Requests).
* **Presence Tracking:** Live online/offline status syncing across the social graph.
* **Optimistic UI:** Instant state updates for a snappy user experience, managed via **Zustand**.

### 🤖 LuminaBot (AI Suite)
* **HTTP Streaming (SSE):** AI responses are delivered via **Server-Sent Events**, enabling real-time "typewriter" effects without the overhead of full duplex WebSockets.
* **Contextual Memory:** LuminaBot maintains persistent conversation history in MongoDB while streaming live updates.

### 🔐 Enterprise-Grade Security
* **Dual-Token System:** Secure Access/Refresh token rotation with **MongoDB** session persistence for session revocation.
* **MFA (Multi-Factor Authentication):** Integrated security layer managed via MongoDB state, ensuring session-locked verification during the dual-token authentication flow.
* **SSO & Manual Auth:** Integrated **Passport.js** supporting Google OAuth and traditional Email/Password flows.

---

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 (Vite), Tailwind CSS, Shadcn UI |
| **State Management** | Zustand (Slices Architecture) |
| **Messaging Engine** | NATS (Core & JetStream) |
| **AI Delivery** | HTTP Server-Sent Events (SSE) |
| **Backend** | Node.js, Express |
| **Database** | MongoDB (Mongoose) |
| **Authentication** | Passport.js (OAuth 2.0), JWT, MFA |

---

## 🏗 System Architecture

Lumina separates data into three distinct "Highways" to optimize performance:

1. **The Instant Highway (NATS Core):** Fire-and-forget messaging for active chats and typing indicators.
2. **The Reliable Highway (JetStream):** Durable consumers store critical events (Friend Requests) until the client acknowledges (`ack`) receipt.
3. **The Knowledge Highway (SSE):** One-way HTTP streaming for LuminaBot's real-time reasoning output.
