---
title: "invoices | Cloud"
slug: /cli/cli/Billing-invoices
sidebar_label: "invoices"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出发票或获取特定发票的详细信息。 | Cloud"
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

此操作列出发票或获取特定发票的详细信息。

## 描述\{#description}

Zilliz Cloud 按组织级别收费。要访问发票，您必须具有 **Organization Owner** 或 **Billing Admin** 权限。

运行此命令而不带任何选项时，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="说明">

发票中的税费将根据您提供的账单地址计算。对于需要填写 VAT 或 GST ID 的公司，请[联系我们](http://support.zilliz.com)。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz billing invoices
[--invoice-id <value>]
[--page-size <value>]
[--page <value>]
[--output <value>]
[-all]
```

## 选项\{#options}

- **--invoice-id** (*string*) -

    指定发票 ID。提供后，将显示该发票的详细信息。其值类似于 `inv-xxxxx`。

- **--page-size** (*integer*) -

    指定每页的条目数。默认值为 **10**。

- **--page** (*integer*) -

    指定要获取的页码。默认值为 **1**。

- **--all, -a** (*boolean*) -

    指定是否获取所有页面。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz billing invoices
```
