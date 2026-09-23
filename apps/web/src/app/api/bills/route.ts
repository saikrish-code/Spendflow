import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { simulateLatency, shouldSimulateError } from '@/lib/utils';

export async function GET(request: NextRequest) {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  const { searchParams } = request.nextUrl;
  const params = {
    status: searchParams.get('status') || undefined,
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : undefined,
    pageSize: searchParams.get('pageSize') ? Number(searchParams.get('pageSize')) : undefined,
    sortBy: searchParams.get('sortBy') || undefined,
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined,
  };

  const result = store.getBills(params);
  return NextResponse.json(result);
}

export async function PATCH(request: NextRequest) {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { billId, status } = body;

    if (!billId || !status) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'billId and status are required', statusCode: 400 },
        { status: 400 }
      );
    }

    const bill = store.updateBillStatus(billId, status);
    if (!bill) {
      return NextResponse.json(
        { error: 'Not Found', message: `Bill ${billId} not found`, statusCode: 404 },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: bill });
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body', statusCode: 400 },
      { status: 400 }
    );
  }
}
