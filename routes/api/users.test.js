const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");

/* eslint-env jest */

jest.mock("../../models/user");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

// mock pt login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Email or password is wrong" });
    }

    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, { expiresIn: "1h" });

    user.token = token;
    await user.save();

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

describe("POST /users/login", () => {
  it("ar trebui să returneze status 200 și un token valid", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
      subscription: "starter",
      token: null,
      save: jest.fn(),
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mocked-token");

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      token: "mocked-token",
      user: {
        email: "test@example.com",
        subscription: "starter",
      },
    });
  });

  it("ar trebui să returneze status 401 pentru email incorect", async () => {
    const req = {
      body: {
        email: "wrong@example.com",
        password: "password123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    User.findOne.mockResolvedValue(null);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email or password is wrong",
    });
  });

  it("ar trebui să returneze status 401 pentru parolă incorectă", async () => {
    const req = {
      body: {
        email: "test@example.com",
        password: "wrongpassword",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const next = jest.fn();

    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      password: await bcrypt.hash("password123", 10),
      subscription: "starter",
    };

    User.findOne.mockResolvedValue(mockUser);
    bcrypt.compare.mockResolvedValue(false);

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Email or password is wrong",
    });
  });
});
