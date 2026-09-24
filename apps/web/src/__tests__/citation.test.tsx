import { expect, test, describe } from 'vitest';
import { parseCitations } from '../components/copilot/citation';

describe('Citation Parser', () => {
  test('parses single citation', () => {
    let clicked = '';
    const parts = parseCitations('The largest is [BILL-0020].', (id) => { clicked = id; });
    
    // parts should be an array with span, badge, span
    expect(Array.isArray(parts)).toBe(true);
    expect(parts?.length).toBe(3);
    
    // Find the Badge element (it's the middle one in this case)
    const badge = parts![1] as any;
    expect(badge.props.children).toBe('BILL-0020');
    
    badge.props.onClick();
    expect(clicked).toBe('BILL-0020');
  });

  test('parses multiple citations', () => {
    const parts = parseCitations('Here are [BILL-0001] and [BILL-0002] for review.', () => {});
    expect(parts?.length).toBe(5);
    
    const badge1 = parts![1] as any;
    const badge2 = parts![3] as any;
    expect(badge1.props.children).toBe('BILL-0001');
    expect(badge2.props.children).toBe('BILL-0002');
  });

  test('returns normal text if no citations', () => {
    const parts = parseCitations('No citations here.', () => {});
    expect(parts?.length).toBe(1);
    expect((parts![0] as any).props.children).toBe('No citations here.');
  });
});
