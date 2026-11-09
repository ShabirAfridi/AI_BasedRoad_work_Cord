# AI-Enhanced Road Work Coordination & Excavation Management System

A full-stack platform that coordinates road excavation work across government departments, automatically detecting and resolving scheduling conflicts to reduce redundant digging and infrastructure damage.

Built as a Final Year Project at Abdul Wali Khan University, Mardan.

---

## The problem

In Pakistan's cities, utility departments (WAPDA, PTCL, SNGPL, and others) excavate roads independently with no shared visibility into each other's schedules. The result: the same stretch of road gets dug open repeatedly within months, wasting public money and damaging infrastructure that was just repaired.

## The solution

This system requires departments to register excavation work in advance. A conflict detection engine automatically flags any overlapping requests on the same road segment and date range, escalating them to an administrator who can approve, reject, or merge conflicting work into a single coordinated session. Citizens can view all active road work on an interactive map and report unauthorized digging.

---

## Features

- **JWT-based authentication** with role-based access control (Admin, Department User, Citizen)
- **Automatic conflict detection** using a custom JPQL date-overlap query — the core engine of the system
- **Admin approval workflow** supporting merge, reject, and reschedule resolutions
- **Interactive map** (Leaflet.js) showing live road work with color-coded status markers
- **Citizen complaint portal** — anonymous or authenticated reporting of illegal digging or road damage
- **Automated email notifications** on conflict detection, approvals, rejections, and complaints
- **Spring AI integration** (Ollama) for delay prediction, smart scheduling recommendations, and complaint categorization — running on free, locally-hosted LLMs

---

## Tech stack

**Backend**
- Java 21, Spring Boot 4
- Spring Security + JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Spring AI + Ollama (Llama 3)
- Liquibase (schema migrations)

**Frontend**
- React.js (Vite)
- React Router
- Axios
- Leaflet.js + OpenStreetMap

---

## Architecture

```
Client (React SPA)
        │
        ▼
Spring Boot REST API
   ├── Security layer (JWT filter, role-based access)
   ├── Controller layer
   ├── Service layer (business logic, conflict detection, AI)
   └── Repository layer (Spring Data JPA)
        │
        ▼
PostgreSQL
```

Full architecture and system design documentation: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

---

## Project structure

```
.
├── backend/          Spring Boot REST API
├── frontend/         React.js client
└── docs/             Architecture notes, ERD, API reference
```

---

## Getting started

See [`backend/README.md`](backend/README.md) and [`frontend/README.md`](frontend/README.md) for setup instructions for each service.

---

## Screenshots

*(Add screenshots or a short demo GIF here — this is the single highest-impact addition for making the repo look complete on first glance.)*

---

## Author

**Shabir Ahmad**,
**Awias Ali Sha**,
**Sohaima**,
Final Year BCS Students — Abdul Wali Khan University, Mardan
[LinkedIn](#) · [Portfolio](#)

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.