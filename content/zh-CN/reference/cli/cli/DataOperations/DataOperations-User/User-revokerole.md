---
title: "revoke-role | Cloud"
slug: /cli/cli/User-revokerole
sidebar_label: "revoke-role"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从用户撤销角色。 | Cloud"
type: docx
token: W7NedO3aXoF3UdxWp51cPe0kn2b
sidebar_position: 6
keywords: 
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - 向量 Database 教程
  - zilliz
  - zilliz cloud
  - cloud
  - revoke-role
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# revoke-role

此操作会从用户撤销角色。

<Admonition type="info" icon="📘" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概述\{#synopsis}

```bash
zilliz user revoke-role
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

    指定要撤销的角色名称。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz user revoke-role --user my_user --role admin
```
