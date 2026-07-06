---
title: "invoices | Cloud"
slug: /cli/cli/Billing-invoices
sidebar_label: "invoices"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists invoices or gets details of a specific invoice. | Cloud"
type: docx
token: Pw8Xd2yoGolKYZxsg1ZcJ0Odnmb
sidebar_position: 3
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - invoices
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# invoices

This operation lists invoices or gets details of a specific invoice.

## Description\{#description}

Zilliz Cloud charges at the organization level. To access invoices, you must have either **Organization Owner** or **Billing Admin** permissions.

Running this command without any options triggers a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

Taxes on the invoices are calculated based on the billing address you provide. For companies that require an entry of VAT or GST ID, please [contact us](http://support.zilliz.com).

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz billing invoices
[--invoice-id <value>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[-all]
```

## Options\{#options}

- **--invoice-id** (*string*) -

    Indicates the invoice ID. If provided, show details of this invoice. The value is similar to `inv-xxxxx`.

- **--page-size** (*integer*) -

    Indicates the number of items per page. The value defaults to **10**.

- **--page** (*integer*) -

    Indicates the page number to retrieve. The value defaults to **1**.

- **--all, -a** (*boolean*) -

    Indicates whether to fetch all pages.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`.

## Example\{#example}

```bash
zilliz billing invoices
```
