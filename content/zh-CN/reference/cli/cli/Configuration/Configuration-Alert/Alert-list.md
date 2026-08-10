---
title: "list | Cloud"
slug: /cli/cli/Alert-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作列出项目的告警规则。 | Cloud"
type: docx
token: DTiIdd5NBocV9JxsNHZcoUownwh
sidebar_position: 5
keywords: 
  - RAG LLM 架构
  - 私有 LLM
  - NN 搜索
  - LLM 评估
  - zilliz
  - zilliz cloud
  - 云
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作列出项目的告警规则。

## 概述\{#synopsis}

```bash
zilliz alert list
[--project-id <value>]
[--page-size <value>]
[--page <value>]
[--output <json | table | text>]
```

## 选项\{#options}

- **--project-id** (*string*) -

    表示项目 ID，例如 `proj-xxxxx`。

    如果项目使用 `zilliz context set` 进行了配置，则在未配置此选项时会自动应用该项目。

- **--page-size** (*integer*) -

    表示每页的条目数。默认值为 **10**。

- **--page** (*integer*) -

    表示页码。默认值为 **1**。

- **--output, -o** (*string*) -

    表示输出格式。可选值：

    - `json`，

    - `table`，

    - `text`。

## 示例\{#example}

```bash
zilliz alert list
```
