# Multi-Sport Court Booking Portal (Dockerized)

A containerized booking and online payment web portal for a multi-sport facility (Football Field, Tennis Court, Beach Volleyball Court, Basketball Court). 

The project is built with **React (Vite)**, **Tailwind CSS v3**, **Express (Node.js)**, and **PostgreSQL**, all fully dockerized with hot reloading.

---

## 🚀 Features

*   **Bilingual Frontend**: Instantly toggle between **English (EN)** and **Italian (IT)**.
*   **Sport-Specific Glowing Aesthetics**: Clean dark UI with customized glow themes for each sport (Football = green, Tennis = lime, Beach Volley = orange, Basketball = blue).
*   **Timeslot Availability Grid**: Renders real-time timeslots (8:00 AM - 10:00 PM) for selected courts and dates, automatically hiding slots that are already booked in the DB.
*   **Simulated Checkout Flow**: Complete billing/payment information form.
    *   *Decline Simulation*: Entering a credit card ending in `0000` will mock a payment rejection to test failure error-handling.
*   **2-Tier Administrative Panel**:
    *   **Tier 1: Viewer (`viewer123`)**:
        *   View dashboard overview (Total bookings, total revenue, bookings scheduled for today).
        *   Interactive table list showing who booked which slots, contact emails, and the amount paid.
        *   Filter/search bookings list.
    *   **Tier 2: Manager (`admin123`)**:
        *   Includes all Tier 1 read access.
        *   **Alter the DB**: Modify court hourly prices in real time.
        *   **Alter the DB**: Manually force book a custom slot (Manual Entry).
        *   **Alter the DB**: Cancel/delete bookings directly from the dashboard table.
        *   **Alter the DB**: Reset the entire database to the default seed values.

---

## 🛠️ Architecture

*   **`frontend/`**: React SPA configured with Vite, using Tailwind CSS and Lucide Icons. Runs on port `3000`.
*   **`backend/`**: REST API built with Express and `pg` pooling to connect to PostgreSQL. Runs on port `5000`.
*   **`db`**: PostgreSQL 15 database populated automatically with a seed script on first boot. Runs on port `5432`.

---

## 🚦 How to Run the Project

Ensure you have [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) installed on your machine.

### 1. Build and Start the Containers

Open your terminal in this directory and execute:

```bash
docker compose up --build
```

This will:
1. Initialize the PostgreSQL database container.
2. Automatically run the seed script `backend/init.sql` to create database tables and insert initial sports courts and mock bookings.
3. Install dependencies inside the backend and frontend containers.
4. Spin up the Node.js API server and the Vite React server.

### 2. Access the Application

Once the startup process finishes, open your browser and navigate to:

*   **Frontend Client**: [http://localhost:3000](http://localhost:3000)
*   **Backend API**: [http://localhost:5000/api/areas](http://localhost:5000/api/areas)

---

## 🔑 Admin Access Keys

To login to the Admin Dashboard (by clicking the "Admin Panel / Pannello Admin" toggle at the top right of the screen), use the following credentials:

*   **Tier 1: Viewer Key**: `viewer123`
*   **Tier 2: Manager Key (DB Alteration)**: `admin123`

---

## 💻 Technical Details & Local Volumes

*   **Hot Reloading**: Bind volumes are mounted in `docker-compose.yml` for `./frontend` and `./backend`. Any changes you make to the code on your host machine will immediately reflect inside the container.
*   **Mock Database Seed**: If you alter the database or want to start fresh, click the **Reset Database / Ripristina DB** button in the Tier 2 Admin Panel.
# sito-sportivo
