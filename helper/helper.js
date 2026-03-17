import bcrypt from "bcryptjs";
import dateTime from "node-datetime";
import { createHash } from "crypto";
import fs from "fs";
import path from "path";

let credentialGen = (length)=>{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

let randomSpecial = (length)=>{
    var result           = '';
    var characters       = '#!@$^*';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

function convertRp(angka) {
    let cekAngka = angka.toString().split(".")
    let rupiah = '';
    let angkarev = cekAngka[0].toString().split('').reverse().join('');
    for (let i = 0; i < angkarev.length; i++)
        if (i % 3 === 0) rupiah += angkarev.substr(i, 3) + '.';

    // return 'Rp. ' + rupiah.split('', rupiah.length - 1).reverse().join('');

    //validasi ketika ada decimal
    if(cekAngka.length === 1){
        return 'Rp. ' + rupiah.split('', rupiah.length - 1).reverse().join('');
    }else {
        return 'Rp. ' + rupiah.split('', rupiah.length - 1).reverse().join('') + ',' + cekAngka[1];
    }
}

function convertToAngka(angka) {
    let cekAngka = angka.toString().split(".")
    // console.log(cekAngka,"===============");
    let rupiah = '';
    let angkarev = cekAngka[0].toString().split('').reverse().join('');
    for (let i = 0; i < angkarev.length; i++)
        if (i % 3 === 0) rupiah += angkarev.substr(i, 3) + '.';

    // return 'Rp. ' + rupiah.split('', rupiah.length - 1).reverse().join('');

    //validasi ketika ada decimal
    if(cekAngka.length === 1){
        return '' + rupiah.split('', rupiah.length - 1).reverse().join('');
    }else {
        return '' + rupiah.split('', rupiah.length - 1).reverse().join('') + ',' + cekAngka[1];
    }
}

let getUniqId = ()=>{
    let dt = dateTime.create();
    let rand = Math.floor(Math.random() * Math.floor(1000));
    let formatted = dt.format('ymdHMS');
    return `${formatted}${rand}`;
};

function convertToRoman(num) {
    if (typeof num !== 'number') 
    return false; 
    
    var digits = String(+num).split(""),
    key = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
    "","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
    "","I","II","III","IV","V","VI","VII","VIII","IX"],
    roman_num = "",
    i = 3;
    while (i--)
    roman_num = (key[+digits.pop() + (i * 10)] || "") + roman_num;
    return Array(+digits.join("") + 1).join("M") + roman_num;
}

function pembilang(bilangan){
    bilangan    = String(bilangan);
     let angka   = new Array('0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0');
     let kata    = new Array('','Satu','Dua','Tiga','Empat','Lima','Enam','Tujuh','Delapan','Sembilan');
     let tingkat = new Array('','Ribu','Juta','Milyar','Triliun');

     let panjang_bilangan = bilangan.length;
     let kalimat= subkalimat = kata1 = kata2 = kata3 = "";
     let i= j= 0;

      /* pengujian panjang bilangan */
            if (panjang_bilangan > 15) {
                kalimat = "Diluar Batas";
                return kalimat;
            }

            /* mengambil angka-angka yang ada dalam bilangan, dimasukkan ke dalam array */
            for (i = 1; i <= panjang_bilangan; i++) {
                angka[i] = bilangan.substr(-(i),1);
            }

            i = 1;
            j = 0;
            kalimat = "";

            /* mulai proses iterasi terhadap array angka */
            while (i <= panjang_bilangan) {

                subkalimat = "";
                kata1 = "";
                kata2 = "";
                kata3 = "";

                /* untuk Ratusan */
                if (angka[i+2] != "0") {
                    if (angka[i+2] == "1") {
                    kata1 = "Seratus";
                    } else {
                    kata1 = kata[angka[i+2]] + " Ratus";
                    }
                }

                /* untuk Puluhan atau Belasan */
                if (angka[i+1] != "0") {
                    if (angka[i+1] == "1") {
                    if (angka[i] == "0") {
                        kata2 = "Sepuluh";
                    } else if (angka[i] == "1") {
                        kata2 = "Sebelas";
                    } else {
                        kata2 = kata[angka[i]] + " Belas";
                    }
                    } else {
                    kata2 = kata[angka[i+1]] + " Puluh";
                    }
                }

                /* untuk Satuan */
                if (angka[i] != "0") {
                    if (angka[i+1] != "1") {
                    kata3 = kata[angka[i]];
                    }
                }

                /* pengujian angka apakah tidak nol semua, lalu ditambahkan tingkat */
                if ((angka[i] != "0") || (angka[i+1] != "0") || (angka[i+2] != "0")) {
                    subkalimat = kata1+" "+kata2+" "+kata3+" "+tingkat[j]+" ";
                }

                /* gabungkan variabe sub kalimat (untuk Satu blok 3 angka) ke variabel kalimat */
                kalimat = subkalimat + kalimat;
                i = i + 3;
                j = j + 1;

            }

            /* mengganti Satu Ribu jadi Seribu jika diperlukan */
            if ((angka[5] == "0") && (angka[6] == "0")) {
                kalimat = kalimat.replace("Satu Ribu","Seribu");
            }

            return (kalimat.trim().replace(/\s{2,}/g, ' ')) + " Rupiah";
}

function capitalLetter(str) {
    str = str.split(" ");
  
    for (var i = 0, x = str.length; i < x; i++) {
      str[i] = str[i][0].toUpperCase() + str[i].substr(1);
    }
  
    return str.join(" ");
}

function sha256(value){
    return createHash('sha256').update(value).digest('hex');
}

function hashBcrypt(value){
    const saltRounds = 10;
    return bcrypt.hashSync(value, saltRounds);
}

function uploadImage(file, file_name, filePath) {
    
    return new Promise((resolve, reject) => {
        let contentType = ["image/jpeg", "image/jpg", "image/png"];
        let ext = [".jpeg", ".jpg", ".png"];
        let extension = path.extname(file.name);
        
        if (extension !== undefined && extension !== "" && extension !== null) {
            if(contentType.indexOf(file.type) !== -1 && ext.indexOf(extension) !== -1){
                let oldPath = file.path;
                let newPath = filePath + file_name + credentialGen(10) + extension;
                let res = newPath.replace(filePath, "");
  
                fs.readFile(oldPath, function (err, data) {
                    if (err) {
                        reject(err.message);
                    }
                    fs.writeFile(newPath, data, function (err) {
                        if (err) {
                            reject(err.message)
                        }
                    });
                    fs.unlink(oldPath, function (err) {
                        if (err) {
                            reject(err.message);
                        }
                    });
                    resolve({
                        data: "Upload sukses",
                        path: res
                    });
                });
            } else {
                reject("File Not Supported");
            }
        } else {
            resolve({
                data: "No File",
                path: ""
            });
        }
    });
}  

function cleanDecimalForBackend (value) {
    if (!value) return 0; // Handle empty input as 0 or null
    
    // Replace comma with dot
    let cleanString = value.replace(',', '.');
    
    // Parse to ensure it is a valid number
    return parseFloat(cleanString);
}

function cleanRupiahForBackend (value) {
    if (!value) return 0; 
    
    // Remove all dots
    let cleanString = value.replace(/\./g, '');

    return parseInt(cleanString, 10);
}
export default  {
    credentialGen,
    randomSpecial,
    convertRp,
    convertToAngka,
    getUniqId,
    convertToRoman,
    pembilang,
    capitalLetter,
    sha256,
    hashBcrypt,
    uploadImage,
    cleanDecimalForBackend,
    cleanRupiahForBackend
}
