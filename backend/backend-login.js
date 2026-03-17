import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import db from "../helper/knex.js";

const login = async (data) => {
  try {
    const [userData] = await db("Users")
    .select("*")
    .where("username", data.username);

    if(userData) {
      if (bcrypt.compareSync(data.password, userData.password)) {
        let roleId = 0;
        if (userData.role === 'admin') {
          roleId = 1;
        } else if (userData.role === 'user') {
          roleId = 2;
        } 

        const tokenData = {
          userid: userData.user_id,
          username: userData.username,
          role: roleId,
          roleName: userData.role
        };
        
        return {
          status: "ok",
          data: jwt.sign(tokenData, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRED || "8h" }),
          message: "Login Sukses",
          userData: tokenData
        }
      } else {
        return {
          status: "nok",
          data: "",
          message: "Password Salah"
        }
      }
    } else {
      return {
        status: "nok",
        data: "",
        message: `User dengan Username ${data.username} Tidak Ditemukan`
      }
    }
  } catch (error) {
    console.log(error);
    return {
      status: "nok",
      data: "",
      message: `${error}`
    }
  }
};

export default {login};