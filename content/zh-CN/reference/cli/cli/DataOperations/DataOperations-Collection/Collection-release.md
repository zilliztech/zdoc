---
title: "release | Cloud"
slug: /cli/cli/Collection-release
sidebar_label: "release"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将集合从内存中释放。 | Cloud"
type: docx
token: G0s2d1DVconhc5xeX02cJWbUnLf
sidebar_position: 12
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
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

此操作会将集合从内存中释放。

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

    指定集合名称。

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，则当此选项未配置时，将自动应用其所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection release --name my_collection
```
