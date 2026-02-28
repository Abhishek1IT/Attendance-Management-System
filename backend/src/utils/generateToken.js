import jwt from "jsonwebtoken";

const generateToken = (user) => {
    return jwt.sign(
        {id: user._id},
        process.env.JWT_SECRET,
        {expiresIn: "2h"}
    );
};

export default generateToken;