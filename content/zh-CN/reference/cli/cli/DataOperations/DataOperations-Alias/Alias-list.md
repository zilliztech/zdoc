---
title: "list | Cloud"
slug: /cli/cli/Alias-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有别名。 | Cloud"
type: docx
token: L8PEdl4Dio11q5x4rPBc4OFZn8b
sidebar_position: 5
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - zilliz
  - zilliz cloud
  - cloud
  - list
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有别名。

## 概要\{#synopsis}

```bash
zilliz alias list [OPTIONS]
```

## 选项\{#options}

- **--database** (*string*) -

    **[必填]**

    指定 Database 名称。

    如果集群使用 `zilliz context set` 进行配置，而此选项未配置，则会自动应用其所属的 Database。

- **--collection** (*string*) -

    指定按 Collection 名称进行筛选。

- **--output, -o** (*string*) -

    指定输出格式。指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz alias list --database default
```
