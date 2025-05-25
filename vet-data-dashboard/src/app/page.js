'use client'

import react from "react";

import UploadFile from "./UploadFile";
import excelToJson from "./excelToJson";
import DataDisplay from "./DataDisplay";
import { MoonLoader } from "react-spinners";

export default function Home() {
    const [file, setFile] = react.useState(null);
    const [fileJson, setFileJson] = react.useState(null);
    const [loading, setLoading] = react.useState(false);
    const [filterOn, setFilterOn] = react.useState(true);
    
    react.useEffect(() => {
        if (!file) {
            return;
        }

        setLoading(true)
        const reader = new FileReader();
        reader.onload = function (event) {
            const data = new Uint8Array(event.target.result);
            let result = excelToJson({ source: data });
            result = result[Object.keys(result)[0]];

            let newResult = {};

            for (let i = 1; i < result.length; i++) {
                const row = result[i]
                if (newResult[row["H"]]) {
                    if (newResult[row["H"]][row["C"]]) {
                        newResult[row["H"]][row["C"]].netto += row["D"];
                        newResult[row["H"]][row["C"]].nettoKtsg += row["G"];
                        newResult[row["H"]][row["C"]].db += row["I"];
                    } else {
                        newResult[row["H"]][row["C"]] = {
                            netto: row["D"],
                            nettoKtsg: row["G"],
                            db: row["I"]
                        }
                    }
                } else {
                    newResult[row["H"]] = {};
                    newResult[row["H"]][row["C"]] = {
                        netto: row["D"],
                        nettoKtsg: row["G"],
                        db: row["I"]
                    };

                }
            }
            
            setFileJson(newResult);
        };
        reader.readAsArrayBuffer(file);
    }, [file])

    react.useEffect(() => {
        setLoading(false);
    }, [fileJson]);

    const handleCheckboxChange = () => {
        setFilterOn(!filterOn);
    }
    return (
        <div className="ml-5 mt-2 mr-5">
            <UploadFile setFile={setFile}/>
            <label>
                <input
                    type="checkbox"
                    checked={filterOn}
                    onChange={handleCheckboxChange}
                    className="mr-2"
                />
                Filter (Név eleje: egyetem, hamvasztás, duobakt, praxislab)
            </label>
            <div className="mt-2">
                <MoonLoader 
                    loading={loading}
                    color="#FFFFFF"
                    cssOverride={{}}
                    speedMultiplier={1}
                />
            </div>
            {
                !loading &&
                <DataDisplay data={fileJson} filterOn={filterOn} />
            }
        </div>
    );
}
