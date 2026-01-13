const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Living Library API is running');
});

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const bookRoutes = require('./routes/books');
app.use('/api/books', bookRoutes);
const excerptRoutes = require('./routes/excerpt');
app.use('/api/excerpt', excerptRoutes);

const settingsRoutes = require('./routes/settings');
app.use('/api/settings', settingsRoutes);

const chatRoutes = require('./routes/chat');
app.use('/api/chat', chatRoutes);

const { startScheduler } = require('./cron/scheduler');
startScheduler();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
