const elderRepository = require('../repositories/elderRepository');

exports.deleteElder = (req, res) => {
    let userId = req.body.id;
    elderRepository.deleteElder(userId, (err, results) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json(results);
        }
    });
}

exports.addElder = (req, res) => {
    let userId = req.params.userId;
    let locationId = req.body.locationId;
    let name = req.body.name;
    let surname = req.body.surname;
    let pendantUUID = req.body.pendantUUID;

    elderRepository.addElder(userId, locationId, name, surname, pendantUUID, (err, data) => {
        if (err) {
            res.status(400).send(err);
        } else {
            res.status(201).json({ success: true, message: 'Record inserted successfully', record: data });
        }
    });
}

exports.configureElder = (req, res) => {
    let userId = req.params.userId;
    let elderId = req.body.elderId;
    let name = req.body.name;
    let surname = req.body.surname;
    let uuid = req.body.uuid;
    let location = req.body.location;
    let houseId = req.body.houseId;

    elderRepository.configureElder(userId, elderId, name, surname, uuid, location, houseId, (err, message) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            res.status(200).send(message);
        }
    });
}

exports.list = (req, res) => {
    const userId = req.params.userId;

    elderRepository.listElders(userId, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(data);
        }
    });
}