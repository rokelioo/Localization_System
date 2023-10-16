const statisticsRepository = require('../repositories/statisticsRepository');

exports.emergency = (req, res) => {
    try {
        const elderId = req.params.elderId;

        statisticsRepository.getEmergencyStatisticsByElderId(elderId, (err, emergencyStats) => {
            if (err) {
                res.status(500).send(err);
            } else {
                if (emergencyStats.length > 0) {
                    res.status(200).json(emergencyStats);
                } else {
                    res.status(404).json({ error: 'Emergency data not found' });
                }
            }
        });
    } catch (error) {
        console.error('Error fetching elder statistics:', error);
        res.status(500).json({ message: 'Error fetching elder statistics' });
    }
}

exports.timeSpent = (req, res) => {
    const elderId = req.params.elderId;

    statisticsRepository.getTimeSpentByElderId(elderId, (err, timeSpentData) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (timeSpentData.length > 0) {
                res.status(200).json(timeSpentData);
            } else {
                res.status(404).json({ error: 'Location time spent data not found' });
            }
        }
    });
}

exports.roomChange = (req, res) => {
    const elderId = req.params.elderId;

    statisticsRepository.getRoomChangeStatisticsByElderId(elderId, (err, roomChangeStats) => {
        if (err) {
            res.status(500).send(err);
        } else {
            if (roomChangeStats.length > 0) {
                res.status(200).json(roomChangeStats);
            } else {
                res.status(404).json({ error: 'Room change data not found' });
            }
        }
    });
}