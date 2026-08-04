---
title: "drop | Cloud"
slug: /cli/cli/Role-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于删除角色。 | Cloud"
type: docx
token: YzVadE24uorV0gx5Se3ceumqnDh
sidebar_position: 3
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
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

此操作用于删除角色。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。你可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz role drop
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
[--yes]
```

## 选项\{#options}

- **--role** (*string*) -

    **[必需]**

    指定要删除的角色名称。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于过滤输出的 JMESPath 表达式。

- **--yes, -y** (*boolean*) -

    指定是否跳过确认提示。

- **--database** (*string*) -

    指定数据库名称。默认值为 `default`。

## 示例\{#example}

```bash
zilliz role drop --role my_role
```
