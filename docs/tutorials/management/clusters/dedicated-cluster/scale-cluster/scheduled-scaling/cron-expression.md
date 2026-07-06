---
title: "Understand Cron Expressions | Cloud"
slug: /cron-expression
sidebar_label: "Cron Expression"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A cron expression defines when a scheduled scaling task runs. Zilliz Cloud uses the standard five-field Unix cron format with minute-level granularity. Cron schedules are evaluated in the timezone you select. | Cloud"
type: origin
token: QUe4wFnNvifiufkXD9xcs0AAnSc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Understand Cron Expressions

A cron expression defines when a scheduled scaling task runs. Zilliz Cloud uses the standard five-field Unix cron format with minute-level granularity. Cron schedules are evaluated in the timezone you select.

```plaintext
* * * * *
│ │ │ │ └── day of week
│ │ │ └──── month
│ │ └────── day of month
│ └──────── hour
└────────── minute
```

| Field | Valid value range | Notes |
| --- | --- | --- |
| `minute` | `0` to `59` | Minute of the hour. |
| `hour` | `0` to `23` | Uses a 24-hour clock. |
| `day of month` | `1` to `31` | If a month does not have the specified day, the schedule does not run in that month. |
| `month` | `1` to `12` | Month of the year. |
| `day of week` | `0` to `6` | `0` represents Sunday, `1` represents Monday, and so on. |

### Supported operators\{#supported-operators}

| Operator | Meaning | Example |
| --- | --- | --- |
| `*` | Any value. | `* * * * *` runs every minute. |
| `,` | List of values. | `0 9,17 * * *` runs at 09:00 and 17:00 every day. |
| `-` | Range of values. | `0 9-17 * * *` runs hourly from 09:00 through 17:00. |
| `/` | Step values. | `*/5 * * * *` runs every 5 minutes. |

### Common cron templates\{#common-cron-templates}

| Use case | Cron expression | Meaning |
| --- | --- | --- |
| Daily at 09:30 | `30 9 * * *` | Runs at 09:30 every day. |
| Weekdays at 09:00 | `0 9 * * 1-5` | Runs at 09:00 from Monday to Friday. |
| Every Sunday at 09:00 | `0 9 * * 0` | Runs at 09:00 every Sunday. |
| Twice daily | `0 9,21 * * *` | Runs at 09:00 and 21:00 every day. |
| Monthly on the 1st at 09:00 | `0 9 1 * *` | Runs at 09:00 on the first day of every month. |

### Example schedules\{#example-schedules}

**Scale up during weekday peak hours and scale down after work**

Create two schedules: one to scale up before peak hours and one to scale down after peak hours.

| Schedule | Cron expression | Target |
| --- | --- | --- |
| Scale up at 09:00, Monday to Friday | `0 9 * * 1-5` | Set Query CU or replica to the peak-hour target. |
| Scale down at 19:00, Monday to Friday | `0 19 * * 1-5` | Set Query CU or replica to the off-peak target. |

**Use lower resources on weekends and restore on Monday**

Create one schedule to scale down on Saturday and one schedule to restore capacity on Monday.

| Schedule | Cron expression | Target |
| --- | --- | --- |
| Scale down every Saturday at 00:00 | `0 0 * * 6` | Set Query CU or replica to the weekend target. |
| Restore every Monday at 09:00 | `0 9 * * 1` | Set Query CU or replica to the weekday target. |

