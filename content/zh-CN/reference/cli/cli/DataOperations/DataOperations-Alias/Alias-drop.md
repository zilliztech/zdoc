---
title: "drop | Cloud"
slug: /cli/cli/Alias-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个别名。 | Cloud"
type: docx
token: CucPdYRmsofWt8xkVj3cK7Vynjg
sidebar_position: 4
keywords: 
  - Faiss 向量 Database
  - Chroma 向量 Database
  - NLP 搜索
  - 幻觉 LLM
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

此操作会删除一个别名。

## 概要\{#synopsis}

```bash
zilliz alias drop
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--alias** (*string*) -

    **[必需]**

    表示要删除的别名名称。

- **--database** (*string*) -

    表示 Database 名称。

    如果使用 `zilliz context set` 配置集群，且未配置此选项，则会自动应用该集群所属的 Database。

- **--output, -o** (*string*) -

    表示输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于过滤输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    表示是否跳过确认提示。

## 示例\{#example}

```bash
zilliz alias drop --alias my_alias
```
