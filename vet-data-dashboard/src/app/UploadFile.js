export default function UploadFile({setFile}) {

    const fileDragOverHandler = (event) => {
        event.preventDefault();
    };

    const fileDropHandler = (event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        setFile(file);
    };

    const uploadFileHandler = (event) => {
        const file = event.target.files[0];
        setFile(file);
    };

    return (
        <div className="max-w-[300px]">
            <label 
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                htmlFor="upload"
            >
                Excel file
            </label>
            <input 
                className="block w-full text-sm text-gray-900 border border-gray-300 
                        rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 p-2
                        focus:outline-none dark:bg-gray-700 dark:border-gray-600 
                        dark:placeholder-gray-400"
                type="file"
                id="upload"
                onDrop={fileDropHandler}
                onDragOver={fileDragOverHandler}
                onChange={uploadFileHandler}
            />
        </div>
    )
}
