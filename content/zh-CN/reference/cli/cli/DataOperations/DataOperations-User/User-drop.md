---
title: "drop | Cloud"
slug: /cli/cli/User-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除一个数据库用户。 | Cloud"
type: docx
token: Isx7dzFS9obGxyxEwgncxs67nXe
sidebar_position: 3
keywords: 
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW
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

此操作会删除一个数据库用户。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概述\{#synopsis}

```bash
zilliz user drop
--user <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--yes]
```

## 选项\{#options}

- **--user** (*string*) -

    **[必填]**

    指定要删除的用户名。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

## 示例\{#example}

```bash
zilliz user drop --user my_user
```
