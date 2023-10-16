const userRepository = require('../repositories/userRepository');

exports.registerUser = (req, res) => {
    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const phone = req.body.phoneNumber;

    userRepository.registerUser(name, surname, email, password, phone, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(data);
        }
    });
}

exports.loginUser = (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;

    userRepository.loginUser(name, pass, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else {
            res.send(data);
        }
    });
}