const monitorRepository = require('../repositories/monitorRepository');

exports.location = (req, res) => {
    const elderId = req.params.elderId;

    monitorRepository.getLocationByElderId(elderId, (err, locationData) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(locationData);
        }
    });
}