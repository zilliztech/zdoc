---
title: "describe | Cloud"
slug: /cli/cli/Project-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取项目的详细信息。 | Cloud"
type: docx
token: OBDNd4bW2oCJqhxEPDSccggSnif
sidebar_position: 2
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
  - 多模态搜索
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作获取项目的详细信息。

## 简介\{#synopsis}

```bash
zilliz project describe
--project-id <value>
[--output <value>]
[--query <value>]
[--no-header]
```

## 选项\{#options}

- **--project-id** (*string*) -

    **[必填]**

    表示项目 ID，类似于 `proj-xxxxx`。

- **--output, -o** (*string*) -

    表示输出格式。可能的值有：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz project describe --project-id proj-xxxxxxxxxxxx
```
