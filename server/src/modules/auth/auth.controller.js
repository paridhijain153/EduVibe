const authService = require('./auth.service');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await authService.registerUser(name, email, password);

    res.status(201).json({
      success: true,
      message: 'User registered',
      data: user
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { user, token } = await authService.loginUser(email, password);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      data: user
    });

  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};