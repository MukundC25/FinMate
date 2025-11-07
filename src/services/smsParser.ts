// SMS Parser - Ported from Python regex patterns
import { ParsedSMS, TransactionType } from '../types';

interface RegexPattern {
  pattern: RegExp;
  type: TransactionType;
}

// Regex patterns for different bank SMS formats
const SMS_PATTERNS: RegexPattern[] = [
  // Kotak Bank - Debit
  {
    pattern: /Sent Rs\.([\d.]+) from (.*?) to (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[ :]*(\d+)/i,
    type: 'sent',
  },
  // Kotak Bank - Credit
  {
    pattern: /Received Rs\.([\d.]+) in your (.*?) from (.*?) on (\d{2}-\d{2}-\d{2}).*?UPI Ref[: ]*(\d+)/i,
    type: 'received',
  },
  // Generic Credit with reversal
  {
    pattern: /Rs\.? ?([\d.]+) is credited to (.*?) Ref no ?(\d+)/i,
    type: 'received',
  },
  // SBI - Debit
  {
    pattern: /A\/C (.*?) debited by ([\d.]+).*?date (\d{2}[A-Za-z]{3}\d{2}).*?Refno (\d+)/i,
    type: 'sent',
  },
  // IPPB - Credit
  {
    pattern: /received a payment of Rs\.? ?([\d.]+).*?a\/c (.*?) on (\d{2}\/\d{2}\/\d{4}).*?Info: UPI\/CREDIT\/(\d+)/i,
    type: 'received',
  },
  // HDFC - Credit
  {
    pattern: /Rs\.([\d.]+) credited to (.*?) on (\d{2}-\d{2}-\d{2}).*?VPA (.*?) \(UPI (\d+)\)/i,
    type: 'received',
  },
  // IPPB - Debit
  {
    pattern: /A\/C (.*?) Debit Rs\.([\d.]+) for UPI to (.*?) on (\d{2}-\d{2}-\d{2}) Ref (\d+)/i,
    type: 'sent',
  },
];

/**
 * Categorize transaction based on merchant/party name and UPI ID
 */
export function categorizeTransaction(party: string, upiId: string = ''): string {
  if (!party && !upiId) return 'Others';
  
  const lowerParty = party.toLowerCase();
  const lowerUpiId = upiId.toLowerCase();
  const combined = `${lowerParty} ${lowerUpiId}`;

  // Food delivery
  if (combined.includes('swiggy') || combined.includes('zomato')) {
    return 'Food';
  }

  // Groceries
  if (combined.includes('blinkit') || combined.includes('bigbasket') || 
      combined.includes('dmart') || combined.includes('grofers')) {
    return 'Groceries';
  }

  // Recharge/Bills
  if (combined.includes('airtel') || combined.includes('jio') || 
      combined.includes('vi') || combined.includes('reliance') ||
      combined.includes('recharge') || combined.includes('billpay')) {
    return 'Recharge/Bills';
  }

  // Wallet/Payment apps
  if (combined.includes('paytm') || combined.includes('phonepe') || 
      combined.includes('googlepay') || combined.includes('amazonpay')) {
    return 'Wallet/Recharge';
  }

  // Merchant payments
  if (combined.includes('bharatpe') || combined.includes('pinelabs') || 
      combined.includes('razorpay') || combined.includes('.rzp@')) {
    return 'P2P / Merchant';
  }

  // Entertainment
  if (combined.includes('netflix') || combined.includes('spotify') || 
      combined.includes('prime') || combined.includes('hotstar') ||
      combined.includes('apple') && combined.includes('services')) {
    return 'Entertainment';
  }

  // Shopping
  if (combined.includes('amazon') || combined.includes('flipkart') || 
      combined.includes('myntra') || combined.includes('ajio')) {
    return 'Shopping';
  }

  // Mandate/Autopay
  if (combined.includes('mandate') || combined.includes('autopay')) {
    return 'Mandate';
  }

  // Bank transfer
  if (combined.includes('kotak') || combined.includes('sbi') || 
      combined.includes('hdfc') || combined.includes('axis') || 
      combined.includes('icici')) {
    return 'Bank Transfer';
  }

  // P2P - Phone numbers or personal UPI IDs
  if (/^\d+@/.test(lowerUpiId) || lowerUpiId.includes('@yescred') || 
      lowerUpiId.includes('@paytm') || lowerUpiId.includes('@okaxis')) {
    return 'P2P';
  }

  return 'Others';
}

/**
 * Parse SMS message and extract transaction details
 */
export function parseSMS(smsBody: string): ParsedSMS | null {
  if (!smsBody) return null;

  for (const { pattern, type } of SMS_PATTERNS) {
    const match = smsBody.match(pattern);
    
    if (match) {
      const groups = match.slice(1); // Remove full match, keep groups
      
      let amount: number;
      let bankAccount: string;
      let party: string;
      let date: string;
      let ref: string;

      if (type === 'sent') {
        // Handle different debit patterns
        if (groups.length === 5) {
          // Pattern: Sent Rs.X from BANK to PARTY on DATE.UPI Ref REF
          [amount, bankAccount, party, date, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
            groups[3],
            groups[4],
          ];
        } else if (groups.length === 4) {
          // Pattern: A/C BANK debited by AMOUNT on DATE Refno REF
          [bankAccount, amount, date, ref] = [
            groups[0],
            parseFloat(groups[1]),
            groups[2],
            groups[3],
          ];
          party = 'Unknown';
        } else {
          continue;
        }
      } else {
        // Handle different credit patterns
        if (groups.length === 5) {
          // Pattern: Received Rs.X in BANK from PARTY on DATE.UPI Ref REF
          [amount, bankAccount, party, date, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
            groups[3],
            groups[4],
          ];
        } else if (groups.length === 4) {
          // Pattern: received payment of Rs.X in a/c BANK on DATE Info: UPI/CREDIT/REF
          [amount, bankAccount, date, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
            groups[3],
          ];
          party = 'Unknown';
        } else if (groups.length === 3) {
          // Pattern: Rs.X credited to BANK Ref no REF (Reversal)
          [amount, bankAccount, ref] = [
            parseFloat(groups[0]),
            groups[1],
            groups[2],
          ];
          date = 'Unknown';
          party = 'Reversal';
        } else {
          continue;
        }
      }

      const category = categorizeTransaction(party, party);

      return {
        type,
        amount,
        bankAccount,
        party,
        date,
        ref,
        category,
      };
    }
  }

  return null;
}

/**
 * Parse multiple SMS messages
 */
export function parseMultipleSMS(smsMessages: string[]): ParsedSMS[] {
  const parsed: ParsedSMS[] = [];
  
  for (const sms of smsMessages) {
    const result = parseSMS(sms);
    if (result) {
      parsed.push(result);
    }
  }
  
  return parsed;
}

/**
 * Check if SMS is a UPI transaction message
 */
export function isUPITransaction(smsBody: string): boolean {
  const upiKeywords = ['upi', 'sent rs', 'received rs', 'debited', 'credited'];
  const lowerBody = smsBody.toLowerCase();
  
  return upiKeywords.some(keyword => lowerBody.includes(keyword));
}
