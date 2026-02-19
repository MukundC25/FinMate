import * as SQLite from 'expo-sqlite';
import { 
  Family, 
  FamilyMember, 
  SharedTransaction, 
  FamilyWithMembers,
  CreateFamilyParams,
  JoinFamilyParams,
  ShareTransactionParams,
  FamilyAnalytics
} from '../types/family.types';
import { Transaction } from '../../../types';

const DB_NAME = 'finmate.db';

async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return await SQLite.openDatabaseAsync(DB_NAME);
}

export const FamilyService = {
  async createFamily(params: CreateFamilyParams): Promise<Family> {
    const database = await getDatabase();
    const familyId = `family_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteCode = this.generateInviteCode();
    const createdAt = Date.now();

    await database.runAsync(
      `INSERT INTO families (id, name, createdByUserId, createdAt, inviteCode)
       VALUES (?, ?, ?, ?, ?)`,
      [familyId, params.name, params.createdByUserId, createdAt, inviteCode]
    );

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await database.runAsync(
      `INSERT INTO family_members (id, familyId, userId, role, joinedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [memberId, familyId, params.createdByUserId, 'admin', createdAt]
    );

    return {
      id: familyId,
      name: params.name,
      createdByUserId: params.createdByUserId,
      createdAt,
      inviteCode,
    };
  },

  async getFamilyByUserId(userId: string): Promise<FamilyWithMembers | null> {
    const database = await getDatabase();

    console.log('🔍 Searching for family member with userId:', userId);
    
    // Join family_members with families to ensure we only get valid families
    // Order by joinedAt DESC to get the most recent family
    const result = await database.getFirstAsync<{ familyId: string; familyName: string }>(
      `SELECT fm.familyId, f.name as familyName 
       FROM family_members fm
       INNER JOIN families f ON fm.familyId = f.id
       WHERE fm.userId = ?
       ORDER BY fm.joinedAt DESC
       LIMIT 1`,
      [userId]
    );

    console.log('🔍 Family member with valid family found:', result);
    if (!result) {
      console.log('⚠️ No valid family found for user');
      return null;
    }

    const family = await database.getFirstAsync<Family>(
      'SELECT * FROM families WHERE id = ?',
      [result.familyId]
    );

    console.log('🔍 Family loaded:', family);
    if (!family) {
      return null;
    }

    const members = await database.getAllAsync<FamilyMember>(
      `SELECT fm.*, u.name as userName, u.email as userEmail 
       FROM family_members fm
       LEFT JOIN users u ON fm.userId = u.id
       WHERE fm.familyId = ?
       ORDER BY fm.role DESC, fm.joinedAt ASC`,
      [family.id]
    );

    return {
      ...family,
      members,
      memberCount: members.length,
    };
  },

  async getFamilyByInviteCode(inviteCode: string): Promise<Family | null> {
    const database = await getDatabase();
    
    const family = await database.getFirstAsync<Family>(
      'SELECT * FROM families WHERE inviteCode = ?',
      [inviteCode]
    );

    return family || null;
  },

  async joinFamily(params: JoinFamilyParams): Promise<FamilyMember> {
    const database = await getDatabase();

    const family = await this.getFamilyByInviteCode(params.inviteCode);
    if (!family) {
      throw new Error('Invalid invite code');
    }

    const existingMember = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [family.id, params.userId]
    );

    if (existingMember) {
      throw new Error('User is already a member of this family');
    }

    const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const joinedAt = Date.now();

    await database.runAsync(
      `INSERT INTO family_members (id, familyId, userId, role, joinedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [memberId, family.id, params.userId, 'member', joinedAt]
    );

    return {
      id: memberId,
      familyId: family.id,
      userId: params.userId,
      role: 'member',
      joinedAt,
    };
  },

  async shareTransaction(params: ShareTransactionParams): Promise<SharedTransaction> {
    const database = await getDatabase();

    const existingShare = await database.getFirstAsync<SharedTransaction>(
      'SELECT * FROM shared_transactions WHERE familyId = ? AND transactionId = ?',
      [params.familyId, params.transactionId]
    );

    if (existingShare) {
      throw new Error('Transaction is already shared with this family');
    }

    const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sharedAt = Date.now();

    await database.runAsync(
      `INSERT INTO shared_transactions (id, familyId, transactionId, sharedByUserId, sharedAt)
       VALUES (?, ?, ?, ?, ?)`,
      [shareId, params.familyId, params.transactionId, params.sharedByUserId, sharedAt]
    );

    await database.runAsync(
      `UPDATE transactions SET isShared = 1, familyId = ? WHERE id = ?`,
      [params.familyId, params.transactionId]
    );

    return {
      id: shareId,
      familyId: params.familyId,
      transactionId: params.transactionId,
      sharedByUserId: params.sharedByUserId,
      sharedAt,
    };
  },

  async unshareTransaction(transactionId: string, familyId: string): Promise<void> {
    const database = await getDatabase();

    await database.runAsync(
      'DELETE FROM shared_transactions WHERE transactionId = ? AND familyId = ?',
      [transactionId, familyId]
    );

    await database.runAsync(
      'UPDATE transactions SET isShared = 0, familyId = NULL WHERE id = ?',
      [transactionId]
    );
  },

  async getSharedTransactions(familyId: string): Promise<Transaction[]> {
    const database = await getDatabase();

    const transactions = await database.getAllAsync<Transaction>(
      `SELECT t.*, st.sharedByUserId, st.sharedAt, u.name as sharedByUserName
       FROM transactions t
       INNER JOIN shared_transactions st ON t.id = st.transactionId
       LEFT JOIN users u ON st.sharedByUserId = u.id
       WHERE st.familyId = ?
       ORDER BY t.date DESC, t.time DESC`,
      [familyId]
    );

    return transactions;
  },

  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    const database = await getDatabase();

    const members = await database.getAllAsync<FamilyMember>(
      `SELECT fm.*, u.name as userName, u.email as userEmail 
       FROM family_members fm
       LEFT JOIN users u ON fm.userId = u.id
       WHERE fm.familyId = ?
       ORDER BY fm.role DESC, fm.joinedAt ASC`,
      [familyId]
    );

    return members;
  },

  async removeMember(familyId: string, userId: string, requestingUserId: string): Promise<void> {
    const database = await getDatabase();

    const requestingMember = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, requestingUserId]
    );

    if (!requestingMember || requestingMember.role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    const targetMember = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!targetMember) {
      throw new Error('Member not found');
    }

    if (targetMember.role === 'admin') {
      const adminCount = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM family_members WHERE familyId = ? AND role = ?',
        [familyId, 'admin']
      );

      if (adminCount && adminCount.count <= 1) {
        throw new Error('Cannot remove the last admin');
      }
    }

    await database.runAsync(
      'DELETE FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );
  },

  async leaveFamily(familyId: string, userId: string): Promise<void> {
    const database = await getDatabase();

    const member = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!member) {
      throw new Error('Not a member of this family');
    }

    if (member.role === 'admin') {
      const adminCount = await database.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM family_members WHERE familyId = ? AND role = ?',
        [familyId, 'admin']
      );

      if (adminCount && adminCount.count <= 1) {
        throw new Error('Cannot leave as the last admin. Transfer admin role or delete the family.');
      }
    }

    await database.runAsync(
      'DELETE FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );
  },

  async deleteFamily(familyId: string, userId: string): Promise<void> {
    const database = await getDatabase();

    const member = await database.getFirstAsync<FamilyMember>(
      'SELECT * FROM family_members WHERE familyId = ? AND userId = ?',
      [familyId, userId]
    );

    if (!member || member.role !== 'admin') {
      throw new Error('Only admins can delete the family');
    }

    await database.runAsync(
      'DELETE FROM families WHERE id = ?',
      [familyId]
    );
  },

  async getFamilyAnalytics(familyId: string, startDate?: string, endDate?: string): Promise<FamilyAnalytics> {
    const database = await getDatabase();

    let dateFilter = '';
    const params: any[] = [familyId];

    if (startDate && endDate) {
      dateFilter = 'AND t.date BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }

    const transactions = await database.getAllAsync<Transaction & { sharedByUserId: string; userName: string }>(
      `SELECT t.*, st.sharedByUserId, u.name as userName
       FROM transactions t
       INNER JOIN shared_transactions st ON t.id = st.transactionId
       LEFT JOIN users u ON st.sharedByUserId = u.id
       WHERE st.familyId = ? ${dateFilter}`,
      params
    );

    const totalSpending = transactions.reduce((sum, t) => sum + t.amount, 0);

    const categoryMap = new Map<string, number>();
    transactions.forEach(t => {
      categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + t.amount);
    });

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const memberMap = new Map<string, { userId: string; userName: string; amount: number }>();
    transactions.forEach(t => {
      const existing = memberMap.get(t.sharedByUserId);
      if (existing) {
        existing.amount += t.amount;
      } else {
        memberMap.set(t.sharedByUserId, {
          userId: t.sharedByUserId,
          userName: t.userName || 'Unknown',
          amount: t.amount,
        });
      }
    });

    const memberContributions = Array.from(memberMap.values()).map(m => ({
      ...m,
      percentage: totalSpending > 0 ? (m.amount / totalSpending) * 100 : 0,
    })).sort((a, b) => b.amount - a.amount);

    const monthMap = new Map<string, number>();
    transactions.forEach(t => {
      const month = t.date.substring(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + t.amount);
    });

    const monthlyTrend = Array.from(monthMap.entries())
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalSpending,
      categoryBreakdown,
      memberContributions,
      monthlyTrend,
    };
  },

  generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  },

  async validateInviteCode(inviteCode: string): Promise<{ isValid: boolean; family?: Family; error?: string }> {
    try {
      const family = await this.getFamilyByInviteCode(inviteCode);
      if (!family) {
        return { isValid: false, error: 'Invalid invite code' };
      }
      return { isValid: true, family };
    } catch (error) {
      return { isValid: false, error: 'Error validating invite code' };
    }
  },
};
