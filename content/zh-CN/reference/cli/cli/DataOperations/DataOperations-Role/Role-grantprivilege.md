---
title: "grant-privilege | Cloud"
slug: /cli/cli/Role-grantprivilege
sidebar_label: "grant-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为角色授予权限。 | Cloud"
type: docx
token: U83ddOym4o7WgAx1ekac4nFHnzf
sidebar_position: 4
keywords: 
  - 向量化
  - k 最近邻算法
  - ANNS
  - 向量搜索
  - zilliz
  - zilliz cloud
  - cloud
  - grant-privilege
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# grant-privilege

此操作为角色授予权限。

## 说明\{#description}

**权限**是指对特定 Zilliz Cloud 资源（如集群、Database 和 Collection）执行特定操作的许可。权限会分配给角色，再将角色授予用户，从而定义用户可以对资源执行的操作。权限的一个示例是向名为 `collection_01` 的 Collection 插入数据的许可。

**权限组**是多个单项权限的组合。您可以创建由常用权限组成的权限组，以简化角色授予过程。为便于使用，Zilliz Cloud 在 Collection、Database 和集群级别提供了 9 个内置权限组。

可用权限列在 [权限与权限组](/docs/cluster-privileges) 中。

<Admonition type="info" icon="📘" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在不同集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz role grant-privilege
--role <value>
--object-type <Global | Collection | Database>
--object-name <value>
--privilege <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--role** (*string*) -

    **[必需]**

    指定角色名称。

- **--object-type** (*string*) -

    **[必需]**

    指定对象类型。可能的值包括：

    - `Global`，

    - `Collection`，

    - `Database`。

- **--object-name** (*string*) -

    **[必需]**

    指定对象名称。您可以使用 `'*'` 来包含指定类型的所有对象。

- **--privilege** (*string*) -

    **[必需]**

    指定权限名称。您可以使用 `'*'` 来包含所有权限。可用权限列在 [权限与权限组](/docs/cluster-privileges) 中。

- **--database** (*string*) -

    指定 Database 名称。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
# Grant search on a specific collection
zilliz role grant-privilege --role my_role --object-type Collection --object-name my_col --privilege Search

# Grant all privileges on all collections
zilliz role grant-privilege --role my_role --object-type Collection --object-name '*' --privilege '*'
```
