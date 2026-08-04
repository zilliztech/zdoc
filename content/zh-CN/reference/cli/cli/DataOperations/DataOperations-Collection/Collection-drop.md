---
title: "drop | Cloud"
slug: /cli/cli/Collection-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个 collection。此操作不可逆。 | Cloud"
type: docx
token: IM2CdOqn5oKCTUxFVImcbDCRnFc
sidebar_position: 4
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - drop
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# drop

此操作会删除一个 collection。此操作不可逆。

## 概述\{#synopsis}

```bash
zilliz collection drop
--name <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--name** (*string*) -

    **[必需]**

    指定要删除的 collection 名称。

- **--database** (*string*) -

    指定数据库名称。

    如果已使用 `zilliz context set` 配置 cluster，且未设置此选项，则会自动应用其所属的数据库。

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

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz collection drop --name my_collection
```
