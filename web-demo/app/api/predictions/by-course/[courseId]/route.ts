import { NextRequest, NextResponse } from 'next/server';
import { parseCSVWithPagination, getCSVPath } from '@/lib/csv-parser';
import { PredictionRecord, PredictionsListResponse } from '@/types/api';

const PREDICTION_CSV_PATH = getCSVPath('node2vec_smote_sample.csv');

/**
 * GET /api/predictions/by-course/[courseId] - Get predictions for a specific course
 * Note: The current CSV doesn't have course_id field, so this will return all predictions
 * In a real scenario, you would filter by course_id from the CSV
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Note: Since the node2vec_smote_sample.csv doesn't contain course_id,
    // we return all predictions. In a production scenario with course_id in the CSV,
    // you would add a filter function here:
    // const filterFn = (row: PredictionRecord & { course_id?: string }) => 
    //   row.course_id === courseId;

    const result = await parseCSVWithPagination<PredictionRecord>(
      PREDICTION_CSV_PATH,
      page,
      limit
    );

    const response: PredictionsListResponse = {
      data: result.data,
      pagination: result.pagination,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in GET /api/predictions/by-course/[courseId]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
