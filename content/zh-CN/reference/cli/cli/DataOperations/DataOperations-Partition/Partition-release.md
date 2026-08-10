---
title: "release | Cloud"
slug: /cli/cli/Partition-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从内存中释放 Partition。 | Cloud"
type: docx
token: XpaudNsR2o3MRoxTbAMcj4tEn1w
sidebar_position: 7
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - release
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# release

此操作会从内存中释放 Partition。

## 概要\{#synopsis}

```bash
zilliz partition release [OPTIONS]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--names** (*array*) -

    **[必需]**

    表示 JSON 数组形式的 Partition 名称。

- **--database** (*string*) -

    表示 Database 名称。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition release --collection my_collection --names '["p1", "p2"]'
```
