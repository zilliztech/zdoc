---
title: "drop | Cloud"
slug: /cli/cli/Role-drop
sidebar_label: "drop"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会删除角色。 | Cloud"
type: docx
token: YzVadE24uorV0gx5Se3ceumqnDh
sidebar_position: 3
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - drop
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# drop

此操作会删除角色。

<Admonition type="info" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

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

- **--role** （*string*） -

    **[必需]**

    指示要删除的角色名称。

- **--output, -o** （*string*） -

    指示输出格式。可选值为：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** （*boolean*） -

    指示当输出设置为 `table` 或 `csv` 时是否省略表头行。

- **--query, -q** （*string*） -

    指示用于筛选输出的 JMESPath 表达式。

- **--yes, -y** （*boolean*） -

    指示是否跳过确认提示。

- **--database** （*string*） -

    指示 Database 名称。该值默认为 `default`。

## 示例\{#example}

```bash
zilliz role drop --role my_role
```
