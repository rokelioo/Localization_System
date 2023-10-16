const houseRepository = require('../repositories/houseRepository');

exports.list = (req, res) => {
    const userId = req.params.userId;

    houseRepository.listHouses(userId, (err, houseList) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(houseList);
        }
    });
}

exports.addHouse = (req, res) => {
    let userId = req.params.userId;
    let address = req.body.address;
    let zipCode = req.body.zipcode;

    houseRepository.addHouse(userId, address, zipCode, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json({ success: true, message: 'Record inserted successfully', record: data });
        }
    });
}

exports.showHouse = (req, res) => {
    const userId = req.query.userId;
    const address = req.query.address;

    houseRepository.showHouse(userId, address, (err, houseData) => {
        if (err) {
            res.status(404).json({ error: err });
        } else {
            res.json(houseData);
        }
    });
}