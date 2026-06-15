---
title: "Cron Expression | BYOC"
slug: /cron-expression
sidebar_label: "Cron Expression"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A cron expression defines a schedule for running a scaling task at specific times. | BYOC"
type: origin
token: UwfQwgneji2a7tkPa1rcQ7Rhnwc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cron Expression

A cron expression defines a schedule for running a scaling task at specific times. 

This guide describes the **Unix cron** format (the standard **5-field** syntax) with **minute-level** granularity. The schedule triggers when **all fields match** the current time. Cron schedules are evaluated in the timezone you selected.

## Expression format and field values\{#expression-format-and-field-values}

A cron expression has five time and date fields separated by a blank. 

```bash
* * * * *
│ │ │ │ └── day of week
│ │ │ └──── month
│ │ └────── day of month
│ └──────── hour
└────────── minute
```

| **Field** | **Valid Value Range** | **Notes** |
| --- | --- | --- |
| `minute` | [0 - 59] | -- |
| `hour` | [0 - 23] | 24-hour clock.<br/>If the `hour` field of a CRON expression has a value of `17`, the field matches any time between `5:00 PM` and `5:59 PM`. |
| `day of month` | [1 - 31] | Not all months have 31 days. If you schedule `31` in a month that has fewer days, the scheduled scaling task will not run in that month. |
| `month` | [1 -12] | -- |
| `day of week` | [0 - 6] | `0` represents `Sunday`, `1` represents `Monday`,  `2` represents `Tuesday`, and so on. |

## Special characters and operators\{#special-characters-and-operators}

These operators can be used in most fields:

| **Operator** | **Meaning** | **Example** |
| --- | --- | --- |
| `*` | any value | `* * * * *` runs every minute. |
| `,` | list of values | `0 9,17 * * *` runs at 09:00 and 17:00 every day. |
| `-` | range of values | `0 9-17 * * *` runs hourly from 09:00 through 17:00. |
| `/` | step values (every N units)<br/>Notes: You can also combine ranges with steps. | `*/5 * * * *` runs every 5 minutes.<br/>`10-50/10 * * * *` runs at minutes 10, 20, 30, 40, 50 of every hour. |

## Examples\{#examples}

This section provides some [simple templates](./cron-expression#simple-templates) that you can directly use. If your suitable requires complex expressions that uses combination of operators, please refer to the examples [here](./cron-expression#common-scenarios).

### Simple templates\{#simple-templates}

| **Use case** | **Cron expression** | **Meaning** |
| --- | --- | --- |
| Every minute | `* * * * *` | Runs every minute |
| Every 5 minutes | `*/5 * * * *` | Runs every 5 minutes |
| Every hour | `0 * * * *` | Runs at the start of every hour |
| Daily at 09:30 | `30 9 * * *` | Runs at 09:30 every day |
| Weekdays at 09:00 | `0 9 * * 1-5` | Runs 09:00 Mon–Fri |
| Monthly on the 1st at 09:00 | `0 9 1 * *` | Runs at 09:00 on the 1st of every month |
| Every Sunday at 09:00 | `0 9 * * 0` | Runs 09:00 every Sunday |
| Twice daily | `0 9,21 * * *` | Runs at 09:00 and 21:00 daily |

### Common scenarios\{#common-scenarios}

The following examples show how to write Unix cron expressions for scheduled scaling tasks based on typical workload patterns.

**Example 1: Scale up during weekday peak hours, then scale down during weekday off-peak**

To do this, create two schedules—one for peak hours and one for off-peak hours.

- **Peak hours:** `* 9-18 * * 1-5`
Runs every minute from 09:00 to 18:59, Monday to Friday.

- **Off-peak:** `* 0-8,19-23 * * 1-5`
 Runs every minute from 00:00 to 08:59 and 19:00 to 23:59, Monday to Friday.

**Example 2: Weekend low-cost mode + Monday restore**

To do this, create two schedules—one for the weekend and one to restore on Monday.

- **Weekend:** `* * * * 0,6`
 Runs every minute on Saturday and Sunday.

- **Monday restore:** `0 9 * * 1`
 Runs at 09:00 every Monday.

