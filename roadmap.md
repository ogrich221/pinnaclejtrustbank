# Admin and customer portal verification

## Transfer limit and balance adjustments
- [x] Set the default and existing daily transfer limit to $10,000,000.
- [x] Verify admin credits and debits update balances, transaction history, and the shared customer record.
- [x] Verify invalid debits cannot overdraw the available balance.

## Uploaded end-to-end account audit
- [x] Test registration, validation, duplicate prevention, and default pending status.
- [ ] Enforce pending, rejected, suspended, and approved access rules in customer login and portal URLs. Pending and approved access are browser-verified; rejected and suspended scenarios remain untested.
- [ ] Test and synchronize admin approval, rejection, suspension, and reactivation with shared storage. Approval is browser-verified; the other status transitions remain untested.
- [x] Verify admin-only routes/functions, self-approval prevention, sign-out, and navigation entry points.
- [x] Remove conflicting customer login fallbacks while preserving the existing design and working features.
- [x] Repeat the real browser scenarios, run regression tests, and report any remaining limitations.
- [x] Add a customer debit card section with test card details, persistent preview controls, and a dashboard entry point.
- [ ] Verify the installed Tawk.to live-chat widget loads outside the sandbox; local Chromium blocks its cross-origin script response.
- [x] Replace the public contact number with +1 000 PJTB and verify its telephone links.
- [x] Check every page on phone and desktop sizes; all public pages load without horizontal overflow, and protected pages redirect correctly.

- [x] Reorganize the customer dashboard and add editable personal details plus a persisted light/dark theme switch in Profile & Settings.

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
