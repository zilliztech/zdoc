---
title: "Cron Expression | Cloud"
slug: /cron-expression
sidebar_label: "Cron Expression"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A cron expression defines a schedule for running a scaling task at specific times. | Cloud"
type: origin
token: UwfQwgneji2a7tkPa1rcQ7Rhnwc
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - manage
  - cron expression
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

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>Valid Value Range</strong></p></th>
     <th><p><strong>Notes</strong></p></th>
   </tr>
   <tr>
     <td><p><code>minute</code></p></td>
     <td><p>[0 - 59]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>hour</code></p></td>
     <td><p>[0 - 23]</p></td>
     <td><p>24-hour clock.</p><p>If the <code>hour</code> field of a CRON expression has a value of <code>17</code>, the field matches any time between <code>5:00 PM</code> and <code>5:59 PM</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>day of month</code></p></td>
     <td><p>[1 - 31]</p></td>
     <td><p>Not all months have 31 days. If you schedule <code>31</code> in a month that has fewer days, the scheduled scaling task will not run in that month.</p></td>
   </tr>
   <tr>
     <td><p><code>month</code></p></td>
     <td><p>[1 -12]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>day of week</code></p></td>
     <td><p>[0 - 6]</p></td>
     <td><p><code>0</code> represents <code>Sunday</code>, <code>1</code> represents <code>Monday</code>,  <code>2</code> represents <code>Tuesday</code>, and so on.</p></td>
   </tr>
</table>

## Special characters and operators\{#special-characters-and-operators}

These operators can be used in most fields:

<table>
   <tr>
     <th><p><strong>Operator</strong></p></th>
     <th><p><strong>Meaning</strong></p></th>
     <th><p><strong>Example</strong></p></th>
   </tr>
   <tr>
     <td><p><code>&ast;</code></p></td>
     <td><p>any value</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code> runs every minute.</p></td>
   </tr>
   <tr>
     <td><p><code>,</code></p></td>
     <td><p>list of values</p></td>
     <td><p><code>0 9,17 &ast; &ast; &ast;</code> runs at 09:00 and 17:00 every day.</p></td>
   </tr>
   <tr>
     <td><p><code>-</code></p></td>
     <td><p>range of values</p></td>
     <td><p><code>0 9-17 &ast; &ast; &ast;</code> runs hourly from 09:00 through 17:00.</p></td>
   </tr>
   <tr>
     <td><p><code>/</code></p></td>
     <td><p>step values (every N units)</p><p>Notes: You can also combine ranges with steps.</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code> runs every 5 minutes.</p><p><code>10-50/10 &ast; &ast; &ast; &ast;</code> runs at minutes 10, 20, 30, 40, 50 of every hour.</p></td>
   </tr>
</table>

## Examples\{#examples}

This section provides some [simple templates](./cron-expression#simple-templates) that you can directly use. If your suitable requires complex expressions that uses combination of operators, please refer to the examples [here](./cron-expression#common-scenarios).

### Simple templates\{#simple-templates}

<table>
   <tr>
     <th><p><strong>Use case</strong></p></th>
     <th><p><strong>Cron expression</strong></p></th>
     <th><p><strong>Meaning</strong></p></th>
   </tr>
   <tr>
     <td><p>Every minute</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>Runs every minute</p></td>
   </tr>
   <tr>
     <td><p>Every 5 minutes</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>Runs every 5 minutes</p></td>
   </tr>
   <tr>
     <td><p>Every hour</p></td>
     <td><p><code>0 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>Runs at the start of every hour</p></td>
   </tr>
   <tr>
     <td><p>Daily at 09:30</p></td>
     <td><p><code>30 9 &ast; &ast; &ast;</code></p></td>
     <td><p>Runs at 09:30 every day</p></td>
   </tr>
   <tr>
     <td><p>Weekdays at 09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 1-5</code></p></td>
     <td><p>Runs 09:00 Mon–Fri</p></td>
   </tr>
   <tr>
     <td><p>Monthly on the 1st at 09:00</p></td>
     <td><p><code>0 9 1 &ast; &ast;</code></p></td>
     <td><p>Runs at 09:00 on the 1st of every month</p></td>
   </tr>
   <tr>
     <td><p>Every Sunday at 09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 0</code></p></td>
     <td><p>Runs 09:00 every Sunday</p></td>
   </tr>
   <tr>
     <td><p>Twice daily</p></td>
     <td><p><code>0 9,21 &ast; &ast; &ast;</code></p></td>
     <td><p>Runs at 09:00 and 21:00 daily</p></td>
   </tr>
</table>

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

