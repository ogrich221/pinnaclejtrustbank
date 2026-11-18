# Fix: admin credits not reaching the customer

## What I found
- Both real customer accounts in the shared records still show a $0 balance and no transactions, so the admin's credit never got saved there.
- The admin's send only saves to the shared record when the customer entry in the admin screen carries an application reference. If that entry came from the admin browser's saved copy (no reference), the save is skipped silently and only the admin's own screen changes, which matches what you saw.

## Fix
1. Credit/debit always saves to the shared customer record using the customer's account key. Nothing is skipped silently.
2. If the shared save fails or the customer can't be found, the admin sees a clear error and no balance change is shown.
3. After each successful credit/debit, the admin list reloads from the shared records so it shows the real saved balance.
4. When the admin list loads, its saved browser copies are merged with the shared records, so every approved customer keeps its link to the shared record.
5. Customer portal: reload the balance and history from the shared record when the page opens and when the tab regains focus, so new credits appear without signing out.

## Checks
- Add a test confirming a credit always uses the shared save path.
- Browser test: admin credits $1,000 to a temporary approved customer, then the customer signs in and sees $1,000 and the entry. Clean up test records afterwards.
- Real customer balances stay untouched.
