---
title: "invoices | Cloud"
slug: /cli/cli/Billing-invoices
sidebar_label: "invoices"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出发票，或获取特定发票的详细信息。 | Cloud"
type: docx
token: Pw8Xd2yoGolKYZxsg1ZcJ0Odnmb
sidebar_position: 3
keywords: 
  - 私有 llms
  - nn 搜索
  - llm 评测
  - 稀疏 vs 稠密
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

此操作列出发票，或获取特定发票的详细信息。

## 说明\{#description}

Zilliz Cloud 在组织级别收费。要访问发票，您必须具有 **Organization Owner** 或 **Billing Admin** 权限。

运行此命令时如果不带任何选项，将触发一组交互式提示。

<Admonition type="info" icon="📘" title="Notes">

发票上的税费将根据您提供的账单地址计算。对于需要填写 VAT 或 GST ID 的公司，请[联系我们](http://support.zilliz.com)。

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

    表示发票 ID。如果提供此参数，则显示该发票的详细信息。其值类似于 `inv-xxxxx`。

- **--page-size** (*integer*) -

    表示每页的项目数。默认值为 **10**。

- **--page** (*integer*) -

    表示要获取的页码。默认值为 **1**。

- **--all, -a** (*boolean*) -

    表示是否获取所有页面。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`。

## 示例\{#example}

```bash
zilliz billing invoices
```
