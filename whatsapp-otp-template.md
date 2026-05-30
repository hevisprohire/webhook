# WhatsApp OTP Template (sms4power / Meta)

## Template not approved yet?

Set in `.env.local` while waiting for Meta:

```env
WHATSAPP_DEV_MODE=true
```

Restart `npm run dev`. OTP will show on screen (no WhatsApp send).  
When template is **Approved**, set `WHATSAPP_DEV_MODE=false` and use the real template ID.

---

## Meta approval tips (reject / pending fix)

| Issue | Fix |
|--------|-----|
| **Rejected — category** | Use **Authentication**, not Marketing |
| **Rejected — body** | Auth templates: do not write custom marketing text; use panel OTP flow |
| **Rejected — sample** | Sample OTP must be 6 digits, e.g. `482951` |
| **Pending 24–48h** | Normal for first template |
| **Business not verified** | Complete Meta Business verification in Business Manager |
| **WABA not linked** | Link WhatsApp Business Account in sms4power |
| **hello_world only** | Default template has no `{{1}}` — cannot send dynamic OTP |

Resubmit with name: `hevis_otp_verify`, category **Authentication**, Copy code button, 5 min expiry.

---

Use this in your **sms4power / WhatsApp Business** template panel.  
After **approval**, copy the **Template ID** into `.env.local` as `WHATSAPP_TEMPLATE_ID`.

---

## Option A — Recommended (Authentication / OTP)

| Field | Value |
|--------|--------|
| **Template name** | `hevis_otp_verify` |
| **Category** | `Authentication` (or OTP / Verification) |
| **Language** | `English (en)` or `English (US)` |
| **OTP button** | `Copy code` |
| **Code expiry (footer)** | `5` minutes |
| **Security disclaimer** | Yes — *For your security, do not share this code.* |

Meta Authentication templates use a **fixed body** like:

> **482951** is your verification code.  
> For your security, do not share this code.  
> This code expires in 5 minutes.

You do **not** type custom body text — the panel generates it.  
Your API sends the code via `template_params` and `button_params` (already in code).

**Sample value for approval (if asked):** `482951`

---

## Option B — Utility template (if Authentication is not available)

Paste these fields exactly:

### Template name
```
hevis_otp_verify
```

### Category
```
Utility
```

### Language
```
English
```

### Header
```
None
```

### Body (copy-paste)
```
{{1}} is your verification code for Hevis.

This code is valid for 5 minutes. For your security, do not share this code with anyone.
```

### Footer (optional)
```
Hevis
```

### Buttons
```
None
```
*(Utility templates often cannot use Copy Code — prefer Option A.)*

### Sample content for variable {{1}} (required for approval)
```
482951
```

---

## After approval — `.env.local`

```env
WHATSAPP_TEMPLATE_ID=<paste_approved_template_id_here>
```

Example (replace with your real ID from panel):
```env
WHATSAPP_TEMPLATE_ID=hevis_otp_verify
```
or
```env
WHATSAPP_TEMPLATE_ID=abc123xyz_approved_id
```

> **Note:** `WHATSAPP_TEMPLATE_ID` must be the **ID from sms4power panel**, not only the display name.  
> Your old `hello_world_*` template has **no {{1}} variable**, so OTP never appeared in the message.

---

## Quick checklist

- [ ] Template **approved** (green status in panel)
- [ ] Category = **Authentication** (best) or Utility with **{{1}}** in body
- [ ] Sample OTP `482951` submitted for review
- [ ] `.env.local` updated with new `WHATSAPP_TEMPLATE_ID`
- [ ] `npm run dev` restarted

---

## How it maps to your API code

| API field | Value |
|-----------|--------|
| `template_id` | from `.env` `WHATSAPP_TEMPLATE_ID` |
| `template_params` | `["482951"]` → fills **{{1}}** in body |
| `button_params` | `["482951"]` → Copy Code button (Authentication only) |

Message the user receives (Utility example):

> **482951** is your verification code for Hevis.  
> This code is valid for 5 minutes. For your security, do not share this code with anyone.  
> — Hevis
