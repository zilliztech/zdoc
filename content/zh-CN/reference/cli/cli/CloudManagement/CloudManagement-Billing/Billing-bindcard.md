---
title: "bind-card | Cloud"
slug: /cli/cli/Billing-bindcard
sidebar_label: "bind-card"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将信用卡绑定到您的账户。 | Cloud"
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

此操作会将信用卡绑定到您的账户。

## 描述\{#description}

Zilliz Cloud 支持通过信用卡付款，您可以使用此命令将信用卡绑定到您的 Zilliz Cloud 账户。

在运行此命令之前，请确保您具有足够的权限：您应为 **Organization Owner** 或 **Billing Admin**。

运行此命令且不带任何选项时，将触发一组交互式提示。

## 概要\{#synopsis}

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

## 选项\{#options}

- **--card-number** (*string*) -

    **[REQUIRED]**

    表示信用卡号。

    该值通常为 16 位字符串，例如 `4242 4242 4242 4242`。

- **--exp-month** (*integer*) -

    **[REQUIRED]**

    表示到期月份。取值范围为 `1` 到 `12`。

- **--exp-year** (*integer*) -

    **[REQUIRED]**

    表示到期年份。例如，`2026`。

- **--cvc** (*string*) -

    **[REQUIRED]**

    表示信用卡安全码。

    该值通常为 3 位字符串，例如 `345`。

- **--output, -o** (*string*) -

    表示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz billing bind-card --card-number 4242424242424242 --exp-month 12 --exp-year 2026 --cvc 123
```
