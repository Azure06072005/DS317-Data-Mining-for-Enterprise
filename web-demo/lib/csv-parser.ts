import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import path from 'path';

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Stream CSV file and process rows one by one
 * @param filePath - Path to CSV file
 * @param onRow - Callback for each row
 * @param onComplete - Callback when streaming is complete
 */
export async function streamCSV<T>(
  filePath: string,
  onRow: (row: T, index: number) => void | Promise<void>,
  onComplete?: (totalRows: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    let rowIndex = 0;

    const parser = parse({
      columns: true,
      skip_empty_lines: true,
      cast: true,
      cast_date: false,
    });

    const stream = createReadStream(filePath);

    parser.on('readable', async function () {
      let record;
      while ((record = parser.read()) !== null) {
        try {
          await onRow(record as T, rowIndex);
          rowIndex++;
        } catch (error) {
          reject(error);
          return;
        }
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      if (onComplete) {
        onComplete(rowIndex);
      }
      resolve();
    });

    stream.pipe(parser);
  });
}

/**
 * Parse CSV with pagination support
 * @param filePath - Path to CSV file
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @param filterFn - Optional filter function
 */
export async function parseCSVWithPagination<T>(
  filePath: string,
  page: number = 1,
  limit: number = 100,
  filterFn?: (row: T) => boolean
): Promise<PaginationResult<T>> {
  const data: T[] = [];
  let totalRows = 0;
  let filteredCount = 0;
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  await streamCSV<T>(
    filePath,
    (row) => {
      // Apply filter if provided
      if (filterFn && !filterFn(row)) {
        return;
      }

      // Count total filtered rows
      if (filteredCount >= startIndex && filteredCount < endIndex) {
        data.push(row);
      }
      filteredCount++;
    },
    (total) => {
      totalRows = total;
    }
  );

  const totalPages = Math.ceil(filteredCount / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total: filteredCount,
      totalPages,
    },
  };
}

/**
 * Aggregate data from CSV file
 * @param filePath - Path to CSV file
 * @param aggregateFn - Function to aggregate rows
 */
export async function aggregateCSV<T, R>(
  filePath: string,
  aggregateFn: (accumulator: R, row: T, index: number) => R,
  initialValue: R
): Promise<R> {
  let result = initialValue;

  await streamCSV<T>(
    filePath,
    (row, index) => {
      result = aggregateFn(result, row, index);
    }
  );

  return result;
}

/**
 * Count total rows in CSV
 */
export async function countCSVRows(filePath: string): Promise<number> {
  let count = 0;
  await streamCSV(filePath, () => {
    count++;
  });
  return count;
}

/**
 * Get CSV file path relative to web-demo directory
 */
export function getCSVPath(filename: string): string {
  return path.join(process.cwd(), filename);
}
