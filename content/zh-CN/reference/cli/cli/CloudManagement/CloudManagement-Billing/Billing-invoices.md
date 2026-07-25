---
displayed_sidbar: cliSidebar
title: "invoices | Cloud"
slug: /cli/cli/Billing-invoices
sidebar_label: "invoices"
added_since: v0.1.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation lists invoices or gets details of a specific invoice. | Cloud"
type: docx
token: D6R2dPsd4owSCAxnFdmcim4bneh
sidebar_position: 2
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - invoices
  - cliv01
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# invoices

This operation lists invoices or gets details of a specific invoice.

## Description

Zilliz Cloud charges at the organization level. To access invoices, you must have either **Organization Owner** or **Billing Admin** permissions.

Running this command without any options triggers a set of interactive prompts.

<Admonition type="info" icon="📘" title="Notes">

<p>Taxes on the invoices are calculated based on the billing address you provide. For companies that require an entry of VAT or GST ID, please <a href="http://support.zilliz.com">contact us</a>.</p>

</Admonition>

## Synopsis

```bash
zilliz billing invoices
[--invoice-id <value>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[-all]
```

## Options

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

## Example

```bash
zilliz billing invoices
```
