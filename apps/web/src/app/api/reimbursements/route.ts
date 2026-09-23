import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { simulateLatency, shouldSimulateError } from '@/lib/utils';
import { ReimbursementCreateSchema } from '@spendflow/shared/schemas';

export async function GET() {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  return NextResponse.json({
    data: store.reimbursements,
    total: store.reimbursements.length,
  });
}

export async function POST(request: NextRequest) {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const parsed = ReimbursementCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
          statusCode: 422,
          details: parsed.error.errors,
        },
        { status: 422 }
      );
    }

    const newReimbursement = {
      id: `RMB-${String(store.reimbursements.length + 1).padStart(3, '0')}`,
      ...parsed.data,
      currency: 'INR' as const,
      status: 'Pending' as const,
      submittedAt: new Date().toISOString(),
    };

    store.addReimbursement(newReimbursement);

    return NextResponse.json({ data: newReimbursement }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body', statusCode: 400 },
      { status: 400 }
    );
  }
}
