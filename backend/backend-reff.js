import db from "../helper/knex.js";
import db2 from "../helper/knex2.js";
import moment from "moment";
import "moment/locale/id.js";
moment.locale("id");

// User Type
const getPKS = async () => {
    try {
        const result = await db("pembiayaan_pks")
            .select("*")
            .where("flag", 1);
            
        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
    }
}

const getHistoryList = async () => {
    try {
        const result = await db("pembiayaan_history as a")
            .join("pembiayaan_pks as b", "a.id_pks", "b.id")
            .join("pembiayaan_layanan as c", "a.id_layanan", "c.id")
            .select(db.raw(`
                a.id, b.tahap, a.batch, c.nama_layanan
            `));

        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
        
    }
}

const getServiceListByPKSId = async (PKSId) => {
    try {
        const result = await db("pembiayaan_layanan")
            .select("*")
            .where("flag", 1)
            .andWhere("id_pks", PKSId);
            
        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
    }
}

const getStepListByPKSId = async (PKSId) => {
    console.log("step be", PKSId);
    
    try {
        const result = await db("pembiayaan_pks")
            .select("tahap")
            .where("flag", 1)
            .andWhere("id", PKSId);
            
        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
    }
}

const getBatchListByPKSIdAndServiceId = async (PKSId, ServiceId) => {
    try {
        const result = await db("pembiayaan_history")
            .select(db.raw(`
                batch
            `))
            .where("id_pks", PKSId)
            .andWhere("id_layanan", ServiceId)
            .andWhere("batch", ">", 0)
            .groupBy("batch")
            .orderBy("batch", "desc");

        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
    }
}

const getBatch =  async () => {
    try {
        const result = await db("pembiayaan_history")
        .select("batch")
        .where("batch", ">", 0)
        .groupBy("batch");

        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
        
    }
}

const getLoanStatus = async () => {
    try {
        const result = await db("pembiayaan_history_status")
            .select("*");

        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
        
    }
}

const getMemberList = async (type) => {
    try {
        // Fetch member data (anggota)
        const result = await db("anggota")
            .select("nik", "nama")
            .where("flag", 1)
            .andWhere("status", "anggota");

        // Fetch employee data (karyawan)
        // const result2 = await db2("mr_karyawan")
        //     .select("nik", "nama");

        // Return appropriate data based on type (dont remove for next use)
        let data;
        // if (type === "2") {
        //     data = result2;
        // } else {
        //     data = result;
        // }

        if (type === "1") {
            data = result;
        }

        return {
            status: "ok",
            data: data,
            message: "Get Data Success",
        };
    } catch (error) {
        console.error("Error in getMemberList:", error);
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
    }
}

const getMemberDetails = async (nik) => {
    try {
        let query = await db("anggota")
            .select(db.raw(`
                no_ktp, tanggal_lahir, tanggal_masuk_kisel
            `))
            .where("flag", 1)
            .andWhere("status", "anggota")
            .andWhere("nik", nik)
            .first();

        // moment for tanggal_lahir
        if (query && query.tanggal_lahir) {
            query.tanggal_lahir = moment(query.tanggal_lahir).format("YYYY-MM-DD");
        }

        // moment for tanggal_masuk_kisel
        if (query && query.tanggal_masuk_kisel) {
            query.tanggal_masuk_kisel = moment(query.tanggal_masuk_kisel).format("YYYY-MM-DD");
        }

        const result = query ? [query] : [];
        
        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        console.error("Error in getMemberDetails:", error);
        return {
            status: "nok",
            data: null,
            message: "Get Data Failed",
        };
    }
}

const getBanks = async () => {
    try {
        const result = await db("bank")
            .select("*");

        return {
            status: "ok",
            data: result,
            message: "Get Data Success",
        };
    } catch (error) {
        return {
            status: "nok",
            data: [],
            message: "Get Data Failed",
        };
        
    }
}

export default {
    getPKS,
    getHistoryList,
    getServiceListByPKSId,
    getBatch,
    getBatchListByPKSIdAndServiceId,
    getStepListByPKSId,
    getLoanStatus,
    getMemberList,
    getMemberDetails,
    getBanks
};
