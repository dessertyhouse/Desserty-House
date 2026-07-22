# Dessert(y) House — agreed order & worker workflow

## Access model
- **Admin only** edits website/order records. Workers do not receive dashboard access.
- Workers report their progress to the owner by WhatsApp/call; the owner records the update in Admin.
- This avoids accidental edits, incorrect worker names, customer-data exposure and unauthorised status changes.

## Order workflow
1. **Request received** — customer request from website or WhatsApp.
2. **Awaiting customer reply** — confirming design, serving count, date or location.
3. **Quote sent** — price and delivery charge shared.
4. **Awaiting advance** — payment follow-up.
5. **Confirmed** — advance/payment terms confirmed; admin assigns a worker.
6. **Ingredients ready** — worker has accepted the job and ingredients are planned.
7. **Baking** — production in progress.
8. **Decorating** — finishing/custom fondant work in progress.
9. **Quality check** — owner checks packaging, wording/design and order details.
10. **Ready for handover** — packed and ready; admin coordinates delivery.
11. **Out for delivery** — delivery partner has collected it.
12. **Completed** — customer received the order.
13. **Cancelled** — stopped order, with reason recorded.

## Worker assignment rules
- Admin selects a worker only after the order is confirmed.
- The selected worker is **locked** after assignment.
- Worker cannot edit the order. The admin records worker updates.
- If reassignment is needed, an owner must enter a required reason. The system retains an audit record of original worker, replacement, time and reason.
- Admin sees each worker’s count of active orders before assigning.

## Delivery model
- Admin coordinates all delivery. Bakers/workers do not change dispatch status.
- The admin records partner name/phone, pickup time, delivery charge and dispatch status where needed.

## Alerts
- Dashboard-only alerts: due today, due tomorrow, overdue, missing worker assignment and delayed production status.
- Automatic WhatsApp reminders are not part of the initial build; they can be added later with Meta WhatsApp Business API.

## Recommended Worker panel fields
- Name, role (baker / decorator / packing assistant / delivery coordinator), phone, active/inactive
- Active order count
- Last assignment date
- Notes/skills: eggless, fondant, brownies, cupcakes, packing
- Assignment history (owner-visible)

## Roles
- Owner: all changes, assignment, reassignment, payment, delivery, publish/delete content.
- Baker/worker: no system access in the agreed first release; reports status to owner.
- Content manager: separate future restricted CMS role, does not see payments/customer phone data.
