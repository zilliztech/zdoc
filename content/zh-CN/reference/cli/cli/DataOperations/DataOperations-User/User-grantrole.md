---
title: "grant-role | Cloud"
slug: /cli/cli/User-grantrole
sidebar_label: "grant-role"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向用户授予角色。 | Cloud"
type: docx
token: SvpmdXjkYo3LYTxt2ipcKhLFnZg
sidebar_position: 4
keywords: 
  - 什么是向量数据库
  - 向量数据库是什么
  - 向量数据库对比
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - grant-role
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-role

此操作会向用户授予角色。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概述\{#synopsis}

```bash
zilliz user grant-role
--user <value>
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--user** (*string*) -

    **[必需]**

    指定用户名。

- **--role** (*string*) -

    **[必需]**

    指定要授予的角色名称。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz user grant-role --user my_user --role admin
```
