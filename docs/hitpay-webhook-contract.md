# HitPay Webhook Contract — Verified from Official Docs

Source of truth: https://docs.hitpayapp.com/apis/guide/events (fetched 2026-10-10).
Companion docs:
- Create Payment Request: https://docs.hitpayapp.com/apis/payment-request/create-request
- Get Payment Status: https://docs.hitpayapp.com/apis/payment-request/get-payment-status
- OpenAPI spec: https://docs.hitpayapp.com/openapi.json

## Webhook delivery contract

HitPay sends HTTP POST webhooks to the registered URL.

Headers on every delivery:
- `Hitpay-Signature`   — HMAC-SHA256 hex digest of the RAW JSON request body,
                          keyed with the webhook's SALT (per-webhook salt from
                          Dashboard → Payments → Developers → Webhooks).
- `Hitpay-Event-Type`  — `created` or `updated` (sub-part of the event).
- `Hitpay-Event-Object`— object type: `charge` / `payout` / `invoice` / `order` / `transfer`.
- `User-Agent`         — `HitPay v2.0`.

So the full event name is `<Hitpay-Event-Object>.<Hitpay-Event-Type>`,
e.g. `charge.created`, `charge.updated`, `payment_request.completed`.

Verification (timing-safe required):
  expected = HMAC_SHA256(salt, rawBody)  -> hex
  ok iff timingSafeEqual(expected, header Hitpay-Signature)
On mismatch: respond 401 and stop.

## Events we care about (deposit settlement)

- `charge.created`          — a payment was successfully completed (status `succeeded`).
- `charge.updated`          — refund / partial refund happened on a completed charge.
- `payment_request.completed` — a payment request has been paid.
- `payment_request.failed`  — a payment request errored.

Charge payload (relevant fields):
```
{
  "id": "<charge uuid>",
  "business_id": "<uuid>",
  "status": "succeeded",
  "currency": "sgd",
  "amount": 913.84,
  "refunded_amount": 0,
  "order_id": "<uuid>",
  "payment_request_id": "<uuid or null>",
  "created_at": "...",
  ...
}
```

Payment-request payload (relevant fields, from create-request / get-status docs):
```
{
  "id": "<payment request uuid>",
  "reference_number": "<merchant reference, editable at create time>",
  "amount": "10.00",        // note: STRING on the payment-request API
  "currency": "sgd",
  "status": "pending|completed|failed|expired|canceled|inactive",
  "payments": [...]
}
```

## API for provider re-query (item 7)

- Base: sandbox `https://api.sandbox.hit-pay.com` / production `https://api.hit-pay.com`.
- Auth header: `X-BUSINESS-API-KEY: <business api key>`.
- Get status: `GET /v1/payment-requests/{request_id}` -> 200 with `status`, `amount`, `currency`, `reference_number`.
- Authoritative status values: `pending`, `completed`, `failed`, `expired`, `canceled`, `inactive`.
  Only `completed` means "paid".

## Settlement invariants for MOK

- `reference_number` at create-request time carries our internal id
  (e.g. `bk_<bookingUuid>` or the gateway attempt id) so a webhook can map
  back to the right booking.
- A webhook alone is NOT trusted to settle. On `charge.created` /
  `payment_request.completed`, we must re-query `GET /v1/payment-requests/{id}`
  and confirm:
    * status === 'completed'
    * amount/currency match the gateway attempt we recorded
    * reference_number matches the attempt
    * environment matches (sandbox vs production key/base-url)
  Only then do the atomic, idempotent settlement.

## MOK env vars (all placeholders in .env.example, real values in Vercel/Supabase env only)

- `HITPAY_API_KEY`        — X-BUSINESS-API-KEY (per environment).
- `HITPAY_API_BASE_URL`   — https://api.sandbox.hit-pay.com (sandbox) or
                             https://api.hit-pay.com (production).
- `HITPAY_WEBHOOK_SALT`   — the per-webhook salt used to sign `Hitpay-Signature`.
- `HITPAY_ENV`            — `sandbox` | `production`.
