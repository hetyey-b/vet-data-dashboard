const XLSX = require("xlsx");
const extend = require("node.extend");

const excelToJson = (function () {
  let _config = {};

  const getCellRow = (cell) => Number(cell.replace(/[A-z]/gi, ""));
  const getCellColumn = (cell) => cell.replace(/[0-9]/g, "").toUpperCase();
  const getRangeBegin = (cell) => cell.match(/^[^:]*/)[0];
  const getRangeEnd = (cell) => cell.match(/[^:]*$/)[0];
  function getSheetCellValue(sheetCell) {
    if (!sheetCell) {
      return undefined;
    }
    if (sheetCell.t === "z" && _config.sheetStubs) {
      return null;
    }
    return sheetCell.t === "n" || sheetCell.t === "d"
      ? sheetCell.v
      : (sheetCell.w && sheetCell.w.trim && sheetCell.w.trim()) || sheetCell.w;
  }

  const parseSheet = (sheetData, workbook) => {
    const sheetName =
      sheetData.constructor === String ? sheetData : sheetData.name;
    const sheet = workbook.Sheets[sheetName];
    const columnToKey = sheetData.columnToKey || _config.columnToKey;
    const range = sheetData.range || _config.range;
    const headerRows =
      (sheetData.header && sheetData.header.rows) ||
      (_config.header && _config.header.rows);
    const headerRowToKeys =
      (sheetData.header && sheetData.header.rowToKeys) ||
      (_config.header && _config.header.rowToKeys);

    let strictRangeColumns;
    let strictRangeRows;
    if (range) {
      strictRangeColumns = {
        from: getCellColumn(getRangeBegin(range)),
        to: getCellColumn(getRangeEnd(range)),
      };

      strictRangeRows = {
        from: getCellRow(getRangeBegin(range)),
        to: getCellRow(getRangeEnd(range)),
      };
    }

    let rows = [];
    for (let cell in sheet) {
      // !ref is not a data to be retrieved || this cell doesn't have a value
      if (
        cell === "!ref" ||
        (sheet[cell].v === undefined &&
          !(_config.sheetStubs && sheet[cell].t === "z"))
      ) {
        continue;
      }

      const row = getCellRow(cell);
      const column = getCellColumn(cell);

      // Is a Header row
      if (headerRows && row <= headerRows) {
        continue;
      }

      // This column is not _configured to be retrieved
      if (columnToKey && !(columnToKey[column] || columnToKey["*"])) {
        continue;
      }

      // This cell is out of the _configured range
      if (
        strictRangeColumns &&
        strictRangeRows &&
        (column < strictRangeColumns.from ||
          column > strictRangeColumns.to ||
          row < strictRangeRows.from ||
          row > strictRangeRows.to)
      ) {
        continue;
      }

      const rowData = (rows[row] = rows[row] || {});
      let columnData =
        columnToKey && (columnToKey[column] || columnToKey["*"])
          ? columnToKey[column] || columnToKey["*"]
          : headerRowToKeys
          ? `{{${column}${headerRowToKeys}}}`
          : column;

      let dataVariables = columnData.match(/{{([^}}]+)}}/g);
      if (dataVariables) {
        dataVariables.forEach((dataVariable) => {
          let dataVariableRef = dataVariable.replace(/[\{\}]*/gi, "");
          let variableValue;
          switch (dataVariableRef) {
            case "columnHeader":
              dataVariableRef = headerRows
                ? `${column}${headerRows}`
                : `${column + 1}`;
            // break;
            default:
              variableValue = getSheetCellValue(sheet[dataVariableRef]);
          }
          columnData = columnData.replace(dataVariable, variableValue);
        });
      }

      if (columnData === "") {
        continue;
      }

      rowData[columnData] = getSheetCellValue(sheet[cell]);

      if (sheetData.appendData) {
        extend(true, rowData, sheetData.appendData);
      }
    }

    // removing first row i.e. 0th rows because first cell itself starts from A1
    rows.shift();

    // Cleaning empty if required
    if (!_config.includeEmptyLines) {
      rows = rows.filter((v) => v !== null && v !== undefined);
    }

    return rows;
  };

  const convertExcelToJson = function (config = {}) {
    _config = config.constructor === String ? JSON.parse(config) : config;

    // ignoring empty lines by default
    _config.includeEmptyLines = _config.includeEmptyLines || false;

    // source has to be defined and should have a value
    if (!(_config.source)) {
      throw new Error(":: 'source' required for _config :: ");
    }

    let workbook = XLSX.read(_config.source, {
      type: "array",
    });

    let sheetsToGet =
      _config.sheets && _config.sheets.constructor === Array
        ? _config.sheets
        : Object.keys(workbook.Sheets).slice(
            0,
            (_config && _config.sheets && _config.sheets.numberOfSheetsToGet) ||
              undefined
          );

    let parsedData = {};
    sheetsToGet.forEach((sheet) => {
      sheet =
        sheet.constructor === String
          ? {
              name: sheet,
            }
          : sheet;

      parsedData[sheet.name] = parseSheet(sheet, workbook);
    });

    return parsedData;
  };

  return convertExcelToJson;
})();

export default excelToJson;

