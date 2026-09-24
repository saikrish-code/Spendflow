import { seedBills } from '@spendflow/shared/seed';

export async function POST(req: Request) {
  // Parse form data from Slack
  const text = await req.text();
  const params = new URLSearchParams(text);
  const command = params.get('command');
  
  if (command !== '/approvals') {
    return new Response('Unknown command', { status: 400 });
  }

  // Get approvals from seed
  const approvals = seedBills.filter((b) => b.status === 'Pending Approval');
  const count = approvals.length;

  const blocks: any[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `You have ${count} pending approvals 💳`,
        emoji: true
      }
    },
    {
      type: "divider"
    }
  ];

  approvals.slice(0, 5).forEach((bill) => {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${bill.vendorName}*\nAmount: ₹${bill.totalAmount.toLocaleString('en-IN')}\nDue: ${bill.dueDate}`
      },
      accessory: {
        type: "button",
        text: {
          type: "plain_text",
          text: "View Details",
          emoji: true
        },
        value: bill.id,
        url: `http://localhost:3000/bills?billId=${bill.id}`,
        action_id: `view_bill_${bill.id}`
      }
    });
  });

  if (count > 5) {
    blocks.push({
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `...and ${count - 5} more pending approvals.`
        }
      ]
    });
  }

  return Response.json({
    response_type: "ephemeral",
    blocks
  });
}
