import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import sqlite from 'better-sqlite3';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { format, startOfDay, subDays, differenceInDays } from 'date-fns';
import { createServer as createViteServer } from 'vite';

const JWT_SECRET = process.env.JWT_SECRET || 'habitmate-secret-key-123';
const db = new sqlite('habitmate.db');

//DATABASE
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    streak INTEGER DEFAULT 0,
    last_open TEXT,
    total_points INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user', -- 'user' or 'admin'
    status TEXT DEFAULT 'active', -- 'active' or 'restricted'
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    label_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    completed INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    FOREIGN KEY (label_id) REFERENCES labels(id)
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    text TEXT NOT NULL,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_id INTEGER NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending' or 'resolved'
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id),
    FOREIGN KEY (reported_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS motivational_quotes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    author TEXT DEFAULT 'Unknown'
  );

  CREATE TABLE IF NOT EXISTS daily_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    percentage INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    UNIQUE(user_id, date)
  );
`);

//initial quote
const quotesCount = db.prepare('SELECT count(*) as count FROM motivational_quotes').get() as { count: number };
if (quotesCount.count === 0) {
  db.prepare('INSERT INTO motivational_quotes (text, author) VALUES (?, ?)').run(
    'The secret of getting ahead is getting started.',
    'Mark Twain'
  );
}

//admin
const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)').run(
    'admin',
    'admin@habitmate.com',
    hashedPassword,
    'admin'
  );
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

//MIDDLEWARE
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
};

//AUTH ROUTES
app.post('/api/register', (req, res) => {
  const { username, email, phone, password } = req.body;
  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db.prepare('INSERT INTO users (username, email, phone, password, last_open) VALUES (?, ?, ?, ?, ?)').run(
      username, email, phone, hashedPassword, format(new Date(), 'yyyy-MM-dd')
    );
    const userId = result.lastInsertRowid;
    const token = jwt.sign({ id: userId, username, role: 'user' }, JWT_SECRET);
    res.json({ token, user: { id: userId, username, email, role: 'user', streak: 0 } });
  } catch (err: any) {
    res.status(400).json({ error: 'Username or email already exists' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.status === 'restricted') {
    return res.status(403).json({ error: 'Your account has been restricted by an admin' });
  }

  //Update streak logic
  const today = format(new Date(), 'yyyy-MM-dd');
  const lastOpen = user.last_open;
  let newStreak = user.streak;

  if (lastOpen !== today) {
    const daysDiff = lastOpen ? differenceInDays(new Date(today), new Date(lastOpen)) : 999;
    if (daysDiff === 1) {
      newStreak += 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    } else if (!lastOpen) {
      newStreak = 1;
    }
    db.prepare('UPDATE users SET streak = ?, last_open = ? WHERE id = ?').run(newStreak, today, user.id);
  }

  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET);
  res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role, streak: newStreak, total_points: user.total_points } });
});

//USER ROUTES
app.get('/api/me', authenticateToken, (req: any, res) => {
  const user = db.prepare('SELECT id, username, email, phone, streak, total_points, role, created_at FROM users WHERE id = ?').get(req.user.id) as any;
  res.json(user);
});

//HABITS & TASKS
app.get('/api/labels', authenticateToken, (req: any, res) => {
  const date = req.query.date as string || format(new Date(), 'yyyy-MM-dd');
  const labels = db.prepare('SELECT * FROM labels WHERE user_id = ? AND date = ?').all(req.user.id, date) as any[];
  const labelsWithTasks = labels.map(label => {
    const tasks = db.prepare('SELECT * FROM tasks WHERE label_id = ?').all(label.id);
    return { ...label, tasks };
  });
  res.json(labelsWithTasks);
});

app.post('/api/labels', authenticateToken, (req: any, res) => {
  const { title, date } = req.body;
  const result = db.prepare('INSERT INTO labels (user_id, title, date) VALUES (?, ?, ?)').run(req.user.id, title, date);
  res.json({ id: result.lastInsertRowid, title, date, tasks: [] });
});

app.post('/api/tasks', authenticateToken, (req: any, res) => {
  const { label_id, text, date } = req.body;
  

  const result = db.prepare('INSERT INTO tasks (label_id, text, date) VALUES (?, ?, ?)').run(label_id, text, date);
  res.json({ id: result.lastInsertRowid, label_id, text, completed: 0, date });
});

app.patch('/api/tasks/:id', authenticateToken, (req: any, res) => {
  const { completed } = req.body;
  const taskId = req.params.id;
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId) as any;
  
  if (!task) return res.status(404).json({ error: 'Task not found' });



  db.prepare('UPDATE tasks SET completed = ? WHERE id = ?').run(completed ? 1 : 0, taskId);
  
  
  updateDailyProgress(req.user.id, task.date);
  
  res.json({ success: true });
});

function updateDailyProgress(userId: number, date: string) {
  const tasks = db.prepare(`
    SELECT t.* FROM tasks t
    JOIN labels l ON t.label_id = l.id
    WHERE l.user_id = ? AND t.date = ?
  `).all(userId, date) as any[];

  if (tasks.length === 0) return;

  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const percentage = Math.round((completed / total) * 100);

  db.prepare(`
    INSERT INTO daily_progress (user_id, date, percentage, total_tasks, completed_tasks)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, date) DO UPDATE SET
      percentage = excluded.percentage,
      total_tasks = excluded.total_tasks,
      completed_tasks = excluded.completed_tasks
  `).run(userId, date, percentage, total, completed);

  // Bonus points if 100%
  if (percentage === 100) {
    
    db.prepare('UPDATE users SET total_points = total_points + 10 WHERE id = ?').run(userId);
  }
}

//HEATMAP DATA
app.get('/api/heatmap', authenticateToken, (req: any, res) => {
  const data = db.prepare('SELECT date, percentage FROM daily_progress WHERE user_id = ?').all(req.user.id);
  res.json(data);
});

//CALENDAR EVENTS
app.get('/api/events', authenticateToken, (req: any, res) => {
  const events = db.prepare('SELECT * FROM events WHERE user_id = ?').all(req.user.id);
  res.json(events);
});

app.post('/api/events', authenticateToken, (req: any, res) => {
  const { title, date, time } = req.body;
  const result = db.prepare('INSERT INTO events (user_id, title, date, time) VALUES (?, ?, ?, ?)').run(req.user.id, title, date, time);
  res.json({ id: result.lastInsertRowid, title, date, time });
});

// SOCIAL
app.get('/api/users/search', authenticateToken, (req: any, res) => {
  const query = req.query.q as string;
  const users = db.prepare('SELECT id, username, total_points FROM users WHERE username LIKE ? AND id != ? LIMIT 10').all(`%${query}%`, req.user.id);
  res.json(users);
});

app.post('/api/report', authenticateToken, (req: any, res) => {
  const { reported_id, reason } = req.body;
  db.prepare('INSERT INTO reports (reporter_id, reported_id, reason) VALUES (?, ?, ?)').run(req.user.id, reported_id, reason);
  res.json({ success: true });
});

app.get('/api/messages/:otherId', authenticateToken, (req: any, res) => {
  const otherId = req.params.otherId;
  const messages = db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) 
       OR (sender_id = ? AND receiver_id = ?)
    ORDER BY timestamp ASC
  `).all(req.user.id, otherId, otherId, req.user.id);
  res.json(messages);
});

// MOTIVATION
app.get('/api/motivation', authenticateToken, (req, res) => {
  const quote = db.prepare('SELECT * FROM motivational_quotes ORDER BY RANDOM() LIMIT 1').get();
  res.json(quote);
});

//ADMIN ROUTES
app.get('/api/admin/users', authenticateToken, isAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, email, role, status, streak, total_points FROM users').all();
  res.json(users);
});

app.patch('/api/admin/users/:id/status', authenticateToken, isAdmin, (req: any, res) => {
  const { status } = req.body;
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ success: true });
});

app.get('/api/admin/reports', authenticateToken, isAdmin, (req, res) => {
  const reports = db.prepare(`
    SELECT r.*, u1.username as reporter, u2.username as reported 
    FROM reports r
    JOIN users u1 ON r.reporter_id = u1.id
    JOIN users u2 ON r.reported_id = u2.id
    WHERE r.status = 'pending'
  `).all();
  res.json(reports);
});

app.post('/api/admin/quotes', authenticateToken, isAdmin, (req: any, res) => {
  const { text, author } = req.body;
  db.prepare('INSERT INTO motivational_quotes (text, author) VALUES (?, ?)').run(text, author);
  res.json({ success: true });
});

//SOCKETS
io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on('send_message', (data) => {
    const { senderId, receiverId, text } = data;
    const result = db.prepare('INSERT INTO messages (sender_id, receiver_id, text) VALUES (?, ?, ?)').run(senderId, receiverId, text);
    const msg = { id: result.lastInsertRowid, senderId, receiverId, text, timestamp: new Date().toISOString() };
    io.to(`user_${receiverId}`).emit('receive_message', msg);
    io.to(`user_${senderId}`).emit('receive_message', msg);
  });
});

//VITE SETUP
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = 3000;
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();