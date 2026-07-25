---
displayed_sidbar: cliSidebar
title: "usage | Cloud"
slug: /cli/cli/Billing-usage
sidebar_label: "usage"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation queries usage costs within a time range. | Cloud"
type: docx
token: CRvbdGmR0oylPKxTLsncACd6ntC
sidebar_position: 3
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - usage
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# usage

This operation queries usage costs within a time range.

## Description

Zilliz Cloud provides detailed usage information for your organization, enabling you to conduct cost analysis across various dimensions. To access invoices, you must have either **Organization Owner** or **Billing Admin** permissions.

## Synopsis

```bash
zilliz billing usage
[--last <value>]
[--month <value>]
[--start <value>]
[--end <value>]
[--output <value>]
```

## Options

- **--last** (*string*) -

    Indicates the relative time range.

    Uses `d` for days, `m` for months. To retrieve the usage statistics within the last 7 days, set this option to `7d`.

- **--month** (*string*) -

    Indicates an expression to query by month. For example, you can use `2026-01`, `last`, `this`, etc

- **--start** (*string*) -

    Indicates the start date of a time range in the format `YYYY-MM-DD` or a valid `ISO-8601` timestamp.

- **--end** (*string*) -

    Indicates the end date of a time range in the format `YYYY-MM-DD` or a valid `ISO-8601` timestamp.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`.

## Example

```bash
zilliz billing usage --last 7d
```
