---
title: "列出 | Cloud"
slug: /cli/cli/Database-list
sidebar_label: "list"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出所有 Database。 | Cloud"
type: docx
token: KiwWdLJ8houEeRxGECEcc3glnoh
sidebar_position: 4
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - Zilliz
  - Zilliz Cloud
  - cloud
  - 列出
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# list

此操作会列出所有 Database。

<Admonition type="info" icon="📘" title="Notes">

此命令适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz database list
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--output, -o** (*string*) -

    指示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz database list
```
