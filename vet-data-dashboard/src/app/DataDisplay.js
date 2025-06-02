import React from "react";
export default function DataDisplay({data,filterOn}) {
    const [openInd, setOpenInd] = React.useState(null);

    const filterValues = [
        "egyetem",
        "hamvasztás",
        "duobakt",
        "praxislab",
        "ct-",
        "szövettan"
    ];

    if (!data) {
        return (<></>)
    }

    const filterOnFn = (product) => {
        if (!filterOn) {
            return true;
        }

        const product_lowercase = product.toLowerCase();

        for (let i = 0; i < filterValues.length; i++) {
            if (product_lowercase.includes(filterValues[i])) {
                return true;
            }
        }

        return false;
    }

    const handleDownloadButtonClick = () => {
        let result = [];
        const doctors = Object.keys(data).sort((a, b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}));
        doctors.forEach(dr => {
            result.push([dr.replace(/,/g, '')]);

            const products = Object.keys(data[dr]);

            products.filter(filterOnFn).forEach(product => {
                result.push([product.replace(/,/g, ''), data[dr][product].netto.toString().replace(/,/g, ''), data[dr][product].nettoKtsg.toString().replace(/,/g, ''), data[dr][product].db.toString().replace(/,/g, '')]);
            })

            result.push([""]);
        });
        
        const csvContent = "data:text/csv;charset=utf-8\nNév,Nettó,Nettó ktsg,DB\n" + result.map(e => e.join(",")).join("\n");

        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }

    const doctors = Object.keys(data).sort((a, b) => a.localeCompare(b, 'en', {'sensitivity': 'base'}));
    return (
        <div>
        <hr className="mb-5 mt-5"/>
        <button
            onClick={handleDownloadButtonClick}
            className="bg-slate-700 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-full"
        >
            Letoltes
        </button>
        <hr className="mb-5 mt-5"/>
        <ul>
            {
                doctors.map((dr,ind) => {
                    if (openInd == ind) {
                        return (
                            <li>
                            <span></span>
                            <div className="grid-cols-4 grid gap-4">
                            <span className="cursor-pointer font-bold bg-gray-700 p-2" onClick={() => {setOpenInd(null)}}>{dr != "" ? dr : "<üres név mező>"}</span>
                            <span className="cursor-pointer bg-gray-700 p-2" onClick={() => {setOpenInd(null)}}>Nettó</span>
                            <span className="cursor-pointer bg-gray-700 p-2" onClick={() => {setOpenInd(null)}}>Nettó Ktg</span>
                            <span className="cursor-pointer bg-gray-700 p-2" onClick={() => {setOpenInd(null)}}>DB</span>
                            {Object.keys(data[dr]).filter(filterOnFn).map(product => (
                                <>
                                <span>{product}</span>
                                <span>{(Math.round(data[dr][product].netto*100)/100).toLocaleString()} Ft</span>
                                <span>{(Math.round(data[dr][product].nettoKtsg*100)/100).toLocaleString()} Ft</span>
                                <span>{(Math.round(data[dr][product].db*100)/100)} db</span>
                                </>
                            ))}
                            </div>
                            <hr className="mb-5 mt-5"/>
                            </li>
                        )
                    }
                    return (
                        <span 
                            className="font-bold bg-gray-700 p-2 block mb-2 cursor-pointer"
                            onClick={() => {setOpenInd(ind)}}
                        >
                            {dr != "" ? dr : "<üres név mező>"}
                        </span>
                    )
                })
            }
        </ul>
        </div>
    )
}
