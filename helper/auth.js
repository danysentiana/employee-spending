import jwt from "jsonwebtoken";

const authCheck = async (token) => {
  if (!token) {
    throw new Error("No token provided.");
  }

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          reject(new Error("Failed to authenticate token."));
        } else {
          resolve(decoded);
        }
      });
    });

    return decoded;
  } catch (error) {
    throw error;
  }
};

export default { authCheck};
