import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export const Auth = {
  hashPassword: async (password: string) => bcrypt.hash(password, 10),
  comparePassword: async (password: string, hash: string) =>
    bcrypt.compare(password, hash),
  signToken: (payload: object) =>
    jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" }),
  verifyToken: (token: string) => jwt.verify(token, process.env.JWT_SECRET!),
};
