const express = require('express');
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser');
const connection = require('./database');
const client = require('./mqttClient');
const schedule = require('node-schedule');
const userRoutes = require('./routes/userRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statisticRoutes = require('./routes/statisticRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const elderRoutes = require('./routes/elderRoutes');
const monitorRoutes = require('./routes/monitorRoutes.js');
const houseRoutes = require('./routes/houseRoutes.js');

const dailyJob = require('./jobs');

app.use(cors());
app.use(bodyParser.json());

app.use('/api/user', userRoutes);
app.use('/api/caregiver', caregiverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/statistic', statisticRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/elder', elderRoutes);
app.use('/api/monitor', monitorRoutes);
app.use('/api/house', houseRoutes);

app.listen(5000, () => {console.log("Server started on port 5000")})