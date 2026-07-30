---
title: "bind-card | Cloud"
slug: /cli/cli/Billing-bindcard
sidebar_label: "bind-card"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation binds a credit card to your account. | Cloud"
type: docx
token: G453dm4ZWo1e0Ux55b3czXwnnId
sidebar_position: 1
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - bind-card
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# bind-card

This operation binds a credit card to your account.

## Description\{#description}

Zilliz Cloud supports payments through credit card, and you can use this command to bind a credit card to your Zilliz Cloud account.

Before running this command, ensure you have sufficient permissions: you should be either an **Organization Owner** or a **Billing Admin**. 

Running this command without any options triggers a set of interactive prompts.

## Synopsis\{#synopsis}

```bash
zilliz billing bind-card 
--card-number <value>
--exp-month <value>
--exp-year <value>
--cvc <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## Options\{#options}

- **--card-number** (*string*) -

    **[REQUIRED]**

    Indicates the credit card number. 

    The value is usually a 16-digit string, such as `4242 4242 4242 4242`.

- **--exp-month** (*integer*) -

    **[REQUIRED]**

    Indicates the expiration month. The value ranges from `1` through `12`.

- **--exp-year** (*integer*) -

    **[REQUIRED]**

    Indicates the expiration year. For example, `2026`.

- **--cvc** (*string*) -

    **[REQUIRED]**

    Indicates the card verification code. 

    The value is usually a 3-digit string, such as `345`.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

## Example\{#example}

```bash
zilliz billing bind-card --card-number 4242424242424242 --exp-month 12 --exp-year 2026 --cvc 123
```
