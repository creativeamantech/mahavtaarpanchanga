# Mahavtaar Panchanga — User Authentication Sheet

This template is for the **Mahavtaar Panchanga** application. It is a user registry, not an authentication provider by itself.

## Create the Google Sheet

1. Create a Google Spreadsheet named **Mahavtaar Panchanga — User Access**.
2. Import `Users-Sheet-Template.csv` as a new tab named exactly `Users`.
3. Keep the header names unchanged; the application integration will use these exact keys.
4. Add one row per account. You will supply the user IDs and account details.

## Columns

| Column | Purpose |
|---|---|
| User_ID | Unique login ID |
| Full_Name | Display name |
| Username | Login name; must be unique |
| Password_Hash | Server-generated password hash only |
| Role | `admin`, `user`, or `viewer` |
| Account_Status | `active`, `inactive`, or `suspended` |
| Access_Panchanga | `TRUE` / `FALSE` |
| Access_Nakshatra | `TRUE` / `FALSE` |
| Access_Hora | `TRUE` / `FALSE` |
| Access_Swara_Yoga | `TRUE` / `FALSE` |
| Access_Muhurta | `TRUE` / `FALSE` |
| Access_Advanced_Calculations | `TRUE` / `FALSE` |
| Valid_Until | Optional ISO date: `YYYY-MM-DD` |
| Created_At | Account creation timestamp |
| Last_Login_At | Updated by the server after successful login |
| Failed_Login_Count | Updated by the server |
| Locked_Until | Temporary lock expiry timestamp, if locked |

## Password safety — important

- **Never type or store a plain-text password in this Google Sheet.**
- `Password_Hash` must contain a strong, salted password hash generated on the trusted server (prefer Argon2id; scrypt is an acceptable alternative).
- Password verification, rate limiting, lockout, session creation, and permission checks must happen server-side. Do not expose the Google Sheets service credentials or privileged API token in browser code.
- Restrict spreadsheet sharing to the application service account and trusted administrators. Do not publish the sheet to the web.
- Do not put real user data in the CSV template committed to GitHub.

## Suggested initial values

- `Role`: `admin`, `user`, or `viewer`
- `Account_Status`: `active`, `inactive`, or `suspended`
- Feature access columns: `TRUE` or `FALSE`

## Integration status

This commit supplies the sheet schema and setup guide only. It does **not** create a Google Sheet, connect credentials, or enable login yet. After the spreadsheet is created, its ID and a secure server-side access method will be needed to wire it into Mahavtaar Panchanga.
