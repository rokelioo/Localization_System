const plannerRepository = require('../repositories/plannerRepository');

exports.list = (req, res) => {
    const userId = req.params.userId;

    plannerRepository.listHousesWithoutPlan(userId, (err, houseList) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.json(houseList);
        }
    });
}

exports.housePlan = (req, res) => {
    let userId = req.params.userId;
    const planReq = req.body.roomInfromation;

    plannerRepository.updateHousePlan(userId, planReq, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(201).json({ success: true, message: 'Record inserted successfully', record: data });
        }
    });
}