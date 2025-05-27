## Qualification step

### First reapply:

- Has at least 1 ACTIVE loan request OR has closed at least 1 loan
- AND has received at least 1 offer (Make sure to check outcome status. Could be approved but LOST after appointment)
- AND Applied by made at least 1 appointment
- AND monthlyIncome > 1250

### Successive reapplies (check based on previous re-apply)

- Has not opted out of auto-reapply
- AND (has clicked on email link
- Or has replied to any Whatsapp messages (only if at least 1 sent because they might have applied before we added Whatsapp automation)
- Or has accepted at least 1 offer)

## Cron job

- Setup schedules for re-apply
  - If date is april 2025, check all leads. Otherwise, only check from last month.
  - Check by user creation date
  - cron job at the start of each month?
  - Use relative time to schedule with jobs (re-apply job)
- Run qualification step
- Schedule re-apply job based on last apply date and time

## re-applyJob

- Check if unsubscribed (second check before sending email)
- No welcome email
- No notification for admin
- New dedicated whatsapp message with all offers
- Get all auto-IPA
- no MLCB report
