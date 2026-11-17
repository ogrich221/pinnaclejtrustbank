# Admin and customer portal verification

- [x] Add secure customer password recovery with emailed reset links and a public reset-password page.
- [ ] Verify actual reset-email delivery and link opening with a real test inbox.
- [x] Require administrator username/email and password before admin pages or approval data are accessible.
- [x] Reproduce and fix new homepage applications not appearing in the admin approval queue.
- [x] Add prominent homepage login access and verify valid, invalid, and newly registered customer sign-ins.
- [ ] Inventory and exercise every admin navigation item, filter, modal, and action.
- [ ] Verify admin changes reach the matching customer portal: profile, status, verification, balances, transactions, limits, and deletion.
- [ ] Verify every customer-originated action reaches admin where relevant: domestic/international transfers, beneficiaries, security/PIN changes, profile details, and session activity.
- [ ] Fix confirmed failures and add focused regression tests for banking rules.
- [ ] Run the automated tests and repeat the affected flows in the live preview; record any remaining limitations.
