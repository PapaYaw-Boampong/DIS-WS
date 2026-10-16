// Browser-side spreadsheet reading and writing with no third-party dependency.
// CSV is parsed directly; .xlsx is a ZIP of XML, which we unzip with the
// platform's DecompressionStream and read with DOMParser.

export type SheetRow = readonly string[];

export type SheetData = {
  readonly headers: readonly string[];
  readonly rows: readonly SheetRow[];
};

/** RFC 4180 style CSV parsing: quoted fields, escaped quotes, CRLF. */
export function parseCsv(text: string): readonly SheetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (quoted) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === "," || char === "\t") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((entry) => entry.some((cell) => cell.trim() !== ""));
}

// ---------------------------------------------------------------- xlsx (zip)

type ZipEntry = { readonly name: string; readonly bytes: Uint8Array };

function readUint16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function readUint32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

async function inflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"));
  const buffer = await new Response(stream).arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Minimal ZIP reader: walks the central directory and returns each entry,
 * inflating deflated members. Enough for the files Excel and Sheets produce.
 */
async function readZip(buffer: ArrayBuffer): Promise<readonly ZipEntry[]> {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);

  // The end-of-central-directory record sits in the last 64KB of the file.
  let endOffset = -1;
  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (readUint32(view, index) === 0x06054b50) {
      endOffset = index;
      break;
    }
  }

  if (endOffset < 0) {
    throw new Error("The file is not a valid .xlsx workbook.");
  }

  const entryCount = readUint16(view, endOffset + 10);
  let pointer = readUint32(view, endOffset + 16);
  const entries: ZipEntry[] = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (readUint32(view, pointer) !== 0x02014b50) {
      break;
    }

    const compression = readUint16(view, pointer + 10);
    const compressedSize = readUint32(view, pointer + 20);
    const nameLength = readUint16(view, pointer + 28);
    const extraLength = readUint16(view, pointer + 30);
    const commentLength = readUint16(view, pointer + 32);
    const localOffset = readUint32(view, pointer + 42);
    const name = new TextDecoder().decode(
      bytes.subarray(pointer + 46, pointer + 46 + nameLength),
    );

    // Jump to the local header to find where the data actually starts.
    const localNameLength = readUint16(view, localOffset + 26);
    const localExtraLength = readUint16(view, localOffset + 28);
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const raw = bytes.subarray(dataStart, dataStart + compressedSize);

    entries.push({
      name,
      bytes: compression === 0 ? raw : await inflateRaw(raw),
    });

    pointer += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

function columnIndex(reference: string) {
  const letters = reference.replace(/\d+/g, "");
  let index = 0;

  for (const letter of letters) {
    index = index * 26 + (letter.charCodeAt(0) - 64);
  }

  return index - 1;
}

async function parseXlsx(file: File): Promise<readonly SheetRow[]> {
  if (typeof DecompressionStream === "undefined") {
    throw new Error(
      "This browser cannot open .xlsx files. Save the sheet as CSV and upload that instead.",
    );
  }

  const entries = await readZip(await file.arrayBuffer());
  const decoder = new TextDecoder();
  const parser = new DOMParser();

  const sharedEntry = entries.find((entry) =>
    entry.name.endsWith("xl/sharedStrings.xml"),
  );
  const sharedStrings: string[] = [];

  if (sharedEntry) {
    const doc = parser.parseFromString(
      decoder.decode(sharedEntry.bytes),
      "application/xml",
    );
    for (const item of Array.from(doc.getElementsByTagName("si"))) {
      // A shared string can be split across several runs.
      const runs = Array.from(item.getElementsByTagName("t")).map(
        (node) => node.textContent ?? "",
      );
      sharedStrings.push(runs.join(""));
    }
  }

  const sheetEntry = entries
    .filter((entry) => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name))
    .sort((first, second) => first.name.localeCompare(second.name))[0];

  if (!sheetEntry) {
    throw new Error("The workbook has no readable worksheet.");
  }

  const doc = parser.parseFromString(
    decoder.decode(sheetEntry.bytes),
    "application/xml",
  );
  const rows: string[][] = [];

  for (const rowNode of Array.from(doc.getElementsByTagName("row"))) {
    const cells: string[] = [];

    for (const cellNode of Array.from(rowNode.getElementsByTagName("c"))) {
      const reference = cellNode.getAttribute("r") ?? "";
      const type = cellNode.getAttribute("t");
      const inline = cellNode.getElementsByTagName("is")[0];
      const valueNode = cellNode.getElementsByTagName("v")[0];
      let value = "";

      if (type === "inlineStr" && inline) {
        value = Array.from(inline.getElementsByTagName("t"))
          .map((node) => node.textContent ?? "")
          .join("");
      } else if (valueNode) {
        const raw = valueNode.textContent ?? "";
        value = type === "s" ? (sharedStrings[Number(raw)] ?? "") : raw;
      }

      const index = reference ? columnIndex(reference) : cells.length;
      while (cells.length < index) {
        cells.push("");
      }
      cells[index] = value;
    }

    if (cells.some((cell) => cell.trim() !== "")) {
      rows.push(cells);
    }
  }

  return rows;
}

/** Reads a .csv, .tsv or .xlsx file into a header row plus data rows. */
export async function readSpreadsheet(file: File): Promise<SheetData> {
  const isExcel =
    file.name.toLowerCase().endsWith(".xlsx") ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const rows = isExcel ? await parseXlsx(file) : parseCsv(await file.text());

  if (!rows.length) {
    return { headers: [], rows: [] };
  }

  const [headerRow, ...dataRows] = rows;
  const headers = headerRow.map((header) => header.trim());

  return {
    headers,
    // Pad short rows so every row lines up with the header columns.
    rows: dataRows.map((row) =>
      headers.map((_, index) => (row[index] ?? "").trim()),
    ),
  };
}

// ------------------------------------------------------------------- export

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function toCsv(
  headers: readonly string[],
  rows: readonly SheetRow[],
): string {
  return [headers, ...rows]
    .map((row) => row.map((cell) => csvCell(String(cell ?? ""))).join(","))
    .join("\r\n");
}

/** Triggers a download of the given rows as a CSV file, Excel-readable. */
export function downloadCsv(
  fileName: string,
  headers: readonly string[],
  rows: readonly SheetRow[],
) {
  // The BOM keeps Excel from mangling accented characters.
  const blob = new Blob([`﻿${toCsv(headers, rows)}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
