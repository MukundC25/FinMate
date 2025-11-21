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
  // SBI - Debit (Multiple formats)
  {
    pattern: /A\/C (.*?) debited by ([\d,]+\.?\d*).*?date (\d{2}[A-Za-z]{3}\d{2}).*?Refno (\d+)/i,
    type: 'sent',
  },
  {
    pattern: /Rs\.([\d,]+\.?\d*) debited from A\/C (.*?) on (\d{2}-\d{2}-\d{2}).*?Ref[: ]*(\d+)/i,
    type: 'sent',
  },
  {
    pattern: /debited.*?Rs\.([\d,]+\.?\d*).*?A\/C (.*?)(?:on|dated) (\d{2}[/-]\d{2}[/-]\d{2,4}).*?(?:Ref|UPI)[: ]*(\d+)/i,
    type: 'sent',
  },
  // SBI - Credit (New format: "Dear UPI User, your A/c XXXXXX5333-credited by Rs.1.00 on 21-11-25 transfer from...")
  {
    pattern: /A\/c\s+(X+\d+)-credited by Rs\.([\d,]+\.?\d*) on (\d{2}-\d{2}-\d{2}) transfer from (.*?)(?:\s|$)/i,
    type: 'received',
  },
  {
    pattern: /your A\/c\s+(X+\d+)-credited by Rs\.([\d,]+\.?\d*) on (\d{2}-\d{2}-\d{2})/i,
    type: 'received',
  },
  // SBI - Credit (Old formats)
  {
    pattern: /A\/C (.*?) credited by ([\d,]+\.?\d*).*?date (\d{2}[A-Za-z]{3}\d{2}).*?Refno (\d+)/i,
    type: 'received',
  },
  {
    pattern: /Rs\.([\d,]+\.?\d*) credited to A\/C (.*?) on (\d{2}-\d{2}-\d{2}).*?Ref[: ]*(\d+)/i,
    type: 'received',
  },
  {
    pattern: /credited.*?Rs\.([\d,]+\.?\d*).*?A\/C (.*?)(?:on|dated) (\d{2}[/-]\d{2}[/-]\d{2,4}).*?(?:Ref|UPI)[: ]*(\d+)/i,
    type: 'received',
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
 * Calculate confidence score for parsed SMS
 */
function calculateConfidence(smsBody: string, match: RegExpMatchArray, type: TransactionType): number {
  let confidence = 0.5; // Base confidence
  
  // Higher confidence for complete matches with all expected groups
  if (match.length >= 5) {
    confidence += 0.2;
  }
  
  // Higher confidence for known bank senders
  const knownBanks = ['kotak', 'sbi', 'hdfc', 'axis', 'icici', 'paytm', 'phonepe'];
  const lowerSMS = smsBody.toLowerCase();
  if (knownBanks.some(bank => lowerSMS.includes(bank))) {
    confidence += 0.2;
  }
  
  // Higher confidence for UPI reference numbers
  if (/upi.*ref.*\d+/i.test(smsBody) || /ref.*no.*\d+/i.test(smsBody)) {
    confidence += 0.1;
  }
  
  // Higher confidence for proper amount format
  if (/rs\.?\s*[\d,]+\.?\d*/i.test(smsBody)) {
    confidence += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(confidence, 1.0);
}

/**
 * Parse SMS message and extract transaction details with confidence scoring
 */
export function parseSMS(smsBody: string): ParsedSMS | null {
  if (!smsBody) return null;

  console.log('🔍 Parsing SMS:', smsBody.substring(0, 100) + '...');

  for (const { pattern, type } of SMS_PATTERNS) {
    const match = smsBody.match(pattern);
    
    if (match) {
      console.log('✅ SMS matched pattern:', type, 'Groups:', match.length - 1);
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
          // Check if it's the new SBI format: A/c X5333-credited by Rs.1.00 on 21-11-25 transfer from PARTY
          if (smsBody.toLowerCase().includes('credited by rs.')) {
            // New SBI format: [bankAccount, amount, date, party]
            [bankAccount, amount, date, party] = [
              groups[0],
              parseFloat(groups[1].replace(/,/g, '')),
              groups[2],
              groups[3],
            ];
            ref = 'N/A';
          } else {
            // Pattern: received payment of Rs.X in a/c BANK on DATE Info: UPI/CREDIT/REF
            [amount, bankAccount, date, ref] = [
              parseFloat(groups[0]),
              groups[1],
              groups[2],
              groups[3],
            ];
            party = 'Unknown';
          }
        } else if (groups.length === 3) {
          // Check if it's the simpler SBI format: your A/c X5333-credited by Rs.1.00 on 21-11-25
          if (smsBody.toLowerCase().includes('credited by rs.')) {
            // New SBI format without party: [bankAccount, amount, date]
            [bankAccount, amount, date] = [
              groups[0],
              parseFloat(groups[1].replace(/,/g, '')),
              groups[2],
            ];
            party = 'Unknown';
            ref = 'N/A';
          } else {
            // Pattern: Rs.X credited to BANK Ref no REF (Reversal)
            [amount, bankAccount, ref] = [
              parseFloat(groups[0]),
              groups[1],
              groups[2],
            ];
            date = 'Unknown';
            party = 'Reversal';
          }
        } else {
          continue;
        }
      }

      const category = categorizeTransaction(party, party);
      
      // Calculate confidence score based on pattern match quality
      const confidence = calculateConfidence(smsBody, match, type);

      return {
        type,
        amount,
        bankAccount,
        party,
        date,
        ref,
        category,
        confidence,
        rawSMS: smsBody,
      };
    }
  }

  console.log('❌ No pattern matched for SMS');
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
