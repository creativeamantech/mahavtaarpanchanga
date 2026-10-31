# Google Sheets user authentication

The application user directory is the `Users` tab in the spreadsheet created for this project.

Spreadsheet ID: `1NN45ok4QVJGlTLD_uHK_a-BBWlK5Hp6XaWw2rHa9Hp8`

## Server-only environment

Configure these variables in the deployment platform's server-side environment (never as `VITE_*` variables):

- `PANCHANGA_USERS_SPREADSHEET_ID`: the spreadsheet ID above.
- `LOVABLE_API_KEY`: the existing Lovable connector gateway credential.
- `GOOGLE_SHEETS_API_KEY`: the existing Google Sheets connection key.
- `PANCHANGA_SESSION_SECRET`: a random secret of at least 32 bytes, used to sign sessions.

Do not commit any secret values. The application fails closed when a required value is missing.

## Users tab columns

A: User_ID; B: Full_Name; C: Username; D: Password_Hash; E: Role; F: Account_Status; G:L: feature permissions; M: Valid_Until; N: Created_At; O: Last_Login_At; P: Failed_Login_Count; Q: Locked_Until.

Roles: `admin`, `user`, `viewer`. Status: `active`, `inactive`, `suspended`. Permissions are `TRUE` or `FALSE`.

Password hashes must use `scrypt$<salt-base64url>$<derived-key-base64url>`. Plain-text passwords are never stored. No default administrator account is created.

## Endpoints

- `POST /api/auth/login` with JSON `{ "username": "...", "password": "..." }`; sets an HttpOnly, Secure, SameSite=Lax 12-hour cookie.
- `GET /api/auth/me`; returns the signed-in user from the cookie.
- `POST /api/auth/logout`; clears the cookie.

Five consecutive incorrect passwords trigger a 15-minute lockout. Authentication is server-side and the session signature is checked with a constant-time comparison.

## Important migration note

The legacy MCP tools currently validate API keys using a different Users-tab column layout (A=Name, B=API Key, C=Active). Do not point the legacy MCP key validator at this new username/password sheet until MCP authentication has been migrated separately. Website login and MCP client authentication are separate protocols.
