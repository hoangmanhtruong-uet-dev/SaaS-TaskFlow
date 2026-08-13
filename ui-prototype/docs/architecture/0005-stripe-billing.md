# ADR-0005: Stripe Billing

- Status: Accepted
- Date: 2026-08-14

## Decision

- Stripe Checkout tạo subscription; Stripe Customer Portal quản lý payment method/cancel.
- Một recurring Price cho Pro theo member/tháng; Price ID đi qua environment variable.
- Entitlement đọc từ bảng subscription đã đồng bộ bằng webhook, không tin client hoặc success URL.
- Webhook `/api/v1/webhooks/stripe` xác minh raw body bằng `STRIPE_WEBHOOK_SECRET` và lưu event ID unique để chống replay.
- Staging dùng Stripe test mode; production dùng live mode với bộ key và webhook endpoint tách biệt.
- Các event tối thiểu: `checkout.session.completed`, `customer.subscription.created|updated|deleted`, `invoice.paid`, `invoice.payment_failed`.

## Consequences

- Billing UI không tự cấp Pro sau redirect.
- Mọi giới hạn project/member được enforce tại backend theo entitlement đã đồng bộ.
- Không commit product/price/customer IDs ngoài biến môi trường.
