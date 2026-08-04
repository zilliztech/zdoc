---
title: "release | Cloud"
slug: /cli/cli/Partition-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将分区从内存中释放。 | Cloud"
type: docx
token: XpaudNsR2o3MRoxTbAMcj4tEn1w
sidebar_position: 7
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
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

此操作会将分区从内存中释放。

## 概要\{#synopsis}

```bash
zilliz partition release [OPTIONS]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[REQUIRED]**

    指定集合名称。

- **--names** (*array*) -

    **[REQUIRED]**

    以 JSON 数组形式指定分区名称。

- **--database** (*string*) -

    指定数据库名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`、`yaml`、`csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz partition release --collection my_collection --names '["p1", "p2"]'
```
