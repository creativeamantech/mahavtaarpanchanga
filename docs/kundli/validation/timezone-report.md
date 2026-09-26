# Timezone, Temporal Transitions & DST Validation Report

## Temporal Precision Architecture
Calculations are converted internally into UTC Milliseconds, Julian Days (JD), and centuries since J2000.0 ($T$). Local date-time parsing utilizes `Intl.DateTimeFormat` across standard IANA timezones.

## Tested Scenarios

### 1. Standard Indian Time (Asia/Kolkata, UTC+05:30)
- Half-hour fractional offset (+5.5 hours = +19,800,000 ms).
- No Daylight Saving Time (DST). Continuous linear UTC flow.
- Verified for Delhi, Ujjain, Chennai, Mumbai, Varanasi.

### 2. Nepal Standard Time (Asia/Kathmandu, UTC+05:45)
- 45-minute fractional offset (+5.75 hours = +20,700,000 ms).
- Tested against IST: Exactly 15 minutes ahead of IST.

### 3. Chatham Islands (Pacific/Chatham, UTC+12:45 / UTC+13:45)
- Extreme eastern fractional timezone near the International Date Line.
- Handles date changes and southern hemisphere seasonal reversal.

### 4. US Daylight Saving Transitions (America/New_York)
- Spring Forward: 01:59:59 EST (UTC-5) $\to$ 03:00:00 EDT (UTC-4).
- Fall Back: 01:59:59 EDT (UTC-4) $\to$ 01:00:00 EST (UTC-5).
- Verified: No NaN, date skips, or duplicate millisecond representations.

### 5. European Transitions (Europe/London)
- GMT (UTC+0) to BST (UTC+1) transitions verified.
