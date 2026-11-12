import type { Metadata } from 'next';
import { BankAccountsManager } from '@/components/admin/bank-accounts-manager';

export const metadata: Metadata = { title: 'Bank accounts' };

export default function AdminBankAccountsPage() {
  return <BankAccountsManager />;
}