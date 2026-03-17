import db from "../helper/knex.js";

const getMenu = async (decoded) => {
  try {
    let query = db("menu_matrix as matrix")
      .join("menu_all as menu", "matrix.menu_id", "menu.menu_id")
      .select(
        "menu.*",
        "menu_parent_id",
        "matrix_order",
      )
      .where("matrix.role_id", decoded.role)
      .where("matrix_status", 1)
      .orderBy("matrix.menu_parent_id", "ASC")
      .orderBy("matrix_order", "ASC")
      .orderBy("menu_type", "ASC");

    const result = await query;
    
    return {
      status: "ok",
      data: {
        result: result,
        auth: decoded,
      },
      message: "Get Data Sidebar Success",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "nok",
      message: "Get Data Sidebar Failed",
    }
  }
}

export default { getMenu }
