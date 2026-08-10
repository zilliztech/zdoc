---
title: "release | Cloud"
slug: /cli/cli/Collection-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将 Collection 从内存中释放。 | Cloud"
type: docx
token: G0s2d1DVconhc5xeX02cJWbUnLf
sidebar_position: 12
keywords: 
  - LLMs
  - 机器学习
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - 云
  - release
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# release

此操作将 Collection 从内存中释放。

## 用法\{#usage}

```bash
zilliz collection release
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

**选项：**

- **--name** (*string*) -

    **[必需]**

    表示 Collection 名称。

- **--database** (*string*) -

    表示 Database 名称。

    如果使用 `zilliz context set` 配置了集群，则在未配置此选项时，会自动应用其所属的 Database。

- **--output, -o** (*string*) -

    表示输出格式。可能的值有：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection release --name my_collection
```
