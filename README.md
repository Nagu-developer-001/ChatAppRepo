# ChatAppRepo
Created while learning Socket IO

This project is a real‑time chat application built with Node.js, Socket.IO, and MongoDB, designed to demonstrate production‑grade message reliability. Unlike basic chat apps, this system implements the same core principles used by WhatsApp, Telegram, Slack, and Discord:
- At‑least‑once delivery using automatic retries
- Exactly‑once storage using unique message IDs (clientOffset)
- Server acknowledgements (ACK) to confirm message persistence
- Duplicate prevention using MongoDB unique constraints
- Recovery after reconnect using serverOffset to fetch missed messages
- Left/Right chat UI to distinguish between sent and received messages
The result is a robust, fault‑tolerant chat system that guarantees:
//* No message loss
//* No duplicate messages
//* Correct ordering
//* Smooth recovery after network issues
This project is ideal for learning or showcasing real‑time systems, idempotent message handling, WebSocket reliability, and scalable backend design.


