---
title: "has | Cloud"
slug: /cli/cli/Collection-has
sidebar_label: "has"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于检查集合是否存在。 | Cloud"
type: docx
token: CidCduwW8oIywtxiHMQc8v2XnBe
sidebar_position: 8
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - has
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# has

此操作用于检查集合是否存在。

## 概要\{#synopsis}

```bash
zilliz collection has
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

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz collection has --name my_collection
```
