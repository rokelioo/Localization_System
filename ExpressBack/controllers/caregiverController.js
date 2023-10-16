const caregiverRepository = require('../repositories/caregiverRepository');

exports.caregiverSettings = (req, res) => {
    const userId = req.params.userId;
    caregiverRepository.getCaregiverById(userId, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(data);
        }
    });
}

exports.caregiverChange = async (req, res) => {
    let userId = req.params.userId;
    let name = req.body.name;
    let surname = req.body.surname;
    let phoneNumber = req.body.phoneNumber;
    let email = req.body.email;
    let oldPassword = req.body.oldPassword;
    let newPassword = req.body.newPassword;

    caregiverRepository.updateCaregiver(userId, name, surname, newPassword, email, phoneNumber, oldPassword, (err, message) => {
        if (err) {
            res.status(500).send({ message: err });
        } else {
            res.status(200).json({ success: true, message });
        }
    });
}