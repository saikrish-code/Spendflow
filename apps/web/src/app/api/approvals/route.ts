import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { simulateLatency, shouldSimulateError } from '@/lib/utils';
import { ApprovalRequestSchema } from '@spendflow/shared/schemas';

export async function GET() {
  await simulateLatency();

  if (shouldSimulateError()) {
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Simulated API failure', statusCode: 500 },
      { status: 500 }
    );
  }

  // Return pending bills for the current user (Priya Sharma)
  const pendingBills = store.getPendingApprovals('Priya Sharma');
  return NextResponse.json({ data: pendingBills, total: pendingBills.length });
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
    const parsed = ApprovalRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: parsed.error.errors.map((e) => e.message).join(', '),
          statusCode: 422,
        },
        { status: 422 }
      );
    }

    const { billId, action, reason } = parsed.data;
    const newStatus = action === 'Approved' ? 'Approved' : 'Rejected';
    const bill = store.updateBillStatus(billId, newStatus);

    if (!bill) {
      return NextResponse.json(
        { error: 'Not Found', message: `Bill ${billId} not found`, statusCode: 404 },
        { status: 404 }
      );
    }

    // Record the approval
    store.addApproval({
      id: `APR-${Date.now()}`,
      billId,
      approverId: 'usr-001',
      approverName: 'Priya Sharma',
      action,
      reason,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({ data: bill });
  } catch {
    return NextResponse.json(
      { error: 'Bad Request', message: 'Invalid request body', statusCode: 400 },
      { status: 400 }
    );
  }
}
