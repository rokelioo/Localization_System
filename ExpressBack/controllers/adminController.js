const adminRepository = require('../repositories/adminRepository');

exports.userList = (req, res) => {
    adminRepository.getUsers((err, data) => {
        if (err) {
            res.status(500).json({ error: err });
        } else {
            res.send(data);
        }
    });
}

exports.configureUser = (req, res) => {
    const { id } = req.params;
    adminRepository.getUserById(id, (err, person) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(person);
        }
    });
}

exports.blockUser = (req, res) => {
    const { pk_id, block } = req.body;
    adminRepository.blockUser(pk_id, block, (err, result) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json(result);
        }
    });
}

exports.sumbitChanges = (req, res) => {
    const userId = req.params.id;
    const { name, surname, password, email, phone } = req.body;
    adminRepository.updateUser(userId, name, surname, password, email, phone, (err, message) => {
        if (err) {
            res.status(500).send(message);
        } else {
            res.status(200).send(message);
        }
    });
}

exports.configureUsersPlan = (req, res) => {
    const { userId, houseId } = req.params;
    const sentData = req.body;
    adminRepository.configureUsersPlan(userId, houseId, sentData, (err, message) => {
        if (err) {
            res.status(500).send(message);
        } else {
            res.status(200).send(message);
        }
    });
}