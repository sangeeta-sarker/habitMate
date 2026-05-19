# Habitmate 

In today’s fast-paced digital world, maintaining consistency in daily habits has become increasingly challenging. Individuals often struggle with time management, motivation, and accountability when trying to build positive routines or eliminate unproductive behaviors. With the rapid growth of technology, there is a strong demand for smart, user-friendly applications that can assist users in tracking, managing, and improving their daily habits in an efficient and engaging way.The HabitMate project is designed to address these challenges by providing a comprehensive habit-tracking platform that enables users to monitor their progress, set goals, and stay motivated over time. The application offers an intuitive interface where users can create and manage habits, visualize their performance, and receive feedback that encourages consistency and self-discipline. By leveraging modern web technologies, the system ensures a responsive and seamless user experience across devices.This project integrates a full-stack development approach, combining a dynamic front-end with a robust back-end and database system. It utilizes technologies such as React for the user interface, Node.js for server-side operations, and SQLite for efficient data storage. The inclusion of real-time features and modern UI components enhances interactivity and usability, making the application both practical and appealing.The primary objective of HabitMate is to help users develop sustainable habits through structured tracking, data visualization, and continuous motivation. By transforming habit formation into an interactive and measurable process, the project aims to improve productivity, personal growth, and overall well-being.
Overall, HabitMate demonstrates how modern software solutions can be applied to solve everyday problems, highlighting the importance of user-centered design and scalable system architecture in contemporary application development.


---

# Key Feature Implementations

# 1. Dynamic User Dashboards & Progress Engine
**GitHub-Style Heatmap:** Custom data grid calculations rendering variable opacity emerald shade grids across an interactive 365-day array mapping precise task completion margins.
**Streak Multiplier:** System checking rules to increment consecutive login/action streaks once a minimum of one milestone task goes into a completed state during a cycle. 
**Points & Badges Ledger:** Accumulates total profile rating stars to highlight productivity progression.

# 2. Time-Context Task Lifecycles
**Hierarchical Organization:** Group tasks into custom organizational labels containing actionable targets and progress checkboxes.
**Rigid 24-Hour Loop Lock:** Monitored system clocks resetting status layers cleanly between 12:00 AM and 11:59 PM. When a window passes, daily check metrics serialize permanently to history logs and cannot be retrospectively altered.

## 3. Interactive Monthly Calendar
* Full-grid tracking panel allowing users to set deadlines, note critical event targets, and configure custom modal reminders across any designated year or calendar month.

## 4. Websocket Social Hub & Live Messaging
**Instant Peer Rooms:** Configured using Socket.io clients allowing live text data pipelines directly across platform members.
**Leaderboards:** Real-time leaderboard rankings tracking global application points.
**Community Safety & Reports:** Moderation flags allowing users to instantly capture code violations or report malicious behavior to the site administration queue.

# 5. Multi-User Administration Panel
**User Matrix Control:** Full administrative monitoring panel tracking general status flags, access profiles, and registration info.
**Moderation Actions:** Interface mechanisms to restrict or unban target profiles immediately.
**Motivational Quote Engine:** Backend interface allowing administrators to inject focus thoughts or text quotes into client view boards.

---

# System Architecture & Stack

| Architecture Layer | Component / Technology | Operational Role |
| :--- | :--- | :--- |
| **Frontend UI** | React (v18), Vite, TypeScript | Client-side views, component lifecycle trees, strict compilation type safety. |
| **Styles & Motion** | Tailwind CSS (v4), Framer Motion | Modern interface design, responsive layout styling, fluid slider/drawer sheet sheets. |
| **Icons Library** | Lucide React | Clean, scalable visual styling icons. |
| **API Server Base** | Express.js, Node.js | Core REST endpoints, user profile matching, JSON Web Token (JWT) authorization routes. |
| **Database Layer** | SQLite (`better-sqlite3`) | Low-latency local relational storage mapping core account profiles and progress tracking details. |
| **Real-time Pipeline**| Socket.io, Socket.io-client | Persistent bi-directional WebSocket connections supporting instantaneous message logs. |

---

# Relational Database Schema Concept

```sql
-- Core User Storage
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  last_open TEXT,
  total_points INTEGER DEFAULT 0,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Checklist Labels
CREATE TABLE IF NOT EXISTS labels (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Nested Targets 
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label_id INTEGER NOT NULL,
  text TEXT NOT NULL,
  completed INTEGER DEFAULT 0,
  date TEXT NOT NULL,
  FOREIGN KEY(label_id) REFERENCES labels(id)
);