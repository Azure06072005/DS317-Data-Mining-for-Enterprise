import { NextRequest, NextResponse } from 'next/server';
import { parseCSVWithPagination, aggregateCSV, getCSVPath } from '@/lib/csv-parser';
import { cache } from '@/lib/cache';
import { PredictionRecord, PredictionStatsResponse, PredictionsListResponse } from '@/types/api';

const PREDICTION_CSV_PATH = getCSVPath('node2vec_smote_sample.csv');
const CACHE_TTL = 300; // 5 minutes

/**
 * GET /api/predictions - List predictions with pagination
 * GET /api/predictions?stats=true - Get prediction statistics
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isStats = searchParams.get('stats') === 'true';

    if (isStats) {
      return await getPredictionStats();
    }

    return await getPredictionsList(searchParams);
  } catch (error) {
    console.error('Error in GET /api/predictions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get paginated list of predictions
 */
async function getPredictionsList(searchParams: URLSearchParams) {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const satisfactionLabel = searchParams.get('satisfaction_label');

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters' },
      { status: 400 }
    );
  }

  // Filter function for satisfaction label
  const filterFn = satisfactionLabel
    ? (row: PredictionRecord) => row.satisfaction_label === Number(satisfactionLabel)
    : undefined;

  const result = await parseCSVWithPagination<PredictionRecord>(
    PREDICTION_CSV_PATH,
    page,
    limit,
    filterFn
  );

  const response: PredictionsListResponse = {
    data: result.data,
    pagination: result.pagination,
  };

  return NextResponse.json(response);
}

/**
 * Get aggregated prediction statistics
 */
async function getPredictionStats() {
  // Try to get from cache first
  const cacheKey = 'predictions:stats';
  const cached = cache.get<PredictionStatsResponse>(cacheKey);
  
  if (cached) {
    return NextResponse.json(cached);
  }

  // Aggregate statistics from CSV
  const stats = await aggregateCSV<PredictionRecord, {
    total: number;
    labelCounts: Map<number, number>;
  }>(
    PREDICTION_CSV_PATH,
    (acc, row) => {
      const label = row.satisfaction_label;
      const currentCount = acc.labelCounts.get(label) || 0;
      acc.labelCounts.set(label, currentCount + 1);
      
      return {
        total: acc.total + 1,
        labelCounts: acc.labelCounts,
      };
    },
    {
      total: 0,
      labelCounts: new Map(),
    }
  );

  // Calculate satisfaction metrics
  const satisfied = stats.labelCounts.get(2) || 0; // Label 2.0 = satisfied
  const dissatisfied = stats.labelCounts.get(1) || 0; // Label 1.0 = dissatisfied
  const satisfactionRate = stats.total > 0 
    ? (satisfied / stats.total) * 100 
    : 0;

  // Build label distribution
  const labelDistribution = Array.from(stats.labelCounts.entries())
    .map(([label, count]) => ({
      label,
      count,
      percentage: (count / stats.total) * 100,
    }))
    .sort((a, b) => a.label - b.label);

  const response: PredictionStatsResponse = {
    total: stats.total,
    satisfied,
    dissatisfied,
    satisfactionRate: Math.round(satisfactionRate * 100) / 100,
    labelDistribution,
  };

  // Cache the result
  cache.set(cacheKey, response, CACHE_TTL);

  return NextResponse.json(response);
}
