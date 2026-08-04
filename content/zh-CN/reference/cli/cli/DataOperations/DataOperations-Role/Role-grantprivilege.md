---
title: "grant-privilege | Cloud"
slug: /cli/cli/Role-grantprivilege
sidebar_label: "grant-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向角色授予权限。 | Cloud"
type: docx
token: U83ddOym4o7WgAx1ekac4nFHnzf
sidebar_position: 4
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
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

此操作会向角色授予权限。

## Description\{#description}

**权限**是指对特定 Zilliz Cloud 资源（如集群、数据库和集合）执行特定操作的许可。权限会分配给角色，再将角色授予用户，从而定义用户可以对这些资源执行的操作。一个权限示例是：允许向名为 `collection_01` 的集合中插入数据。

**权限组**是多个单项权限的组合。您可以创建由常用权限组成的权限组，以简化角色授权过程。为便于使用，Zilliz Cloud 在集合、数据库和集群级别提供了 9 个内置权限组。

可用权限列于[Privileges and Privilege Groups](/docs/cluster-privileges)。

<Admonition type="info" icon="📘" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在不同集群之间切换。

</Admonition>

## Synopsis\{#synopsis}

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

## Options\{#options}

- **--role** (*string*) -

    **[REQUIRED]**

    指定角色名称。

- **--object-type** (*string*) -

    **[REQUIRED]**

    指定对象类型。可选值：

    - `Global`,

    - `Collection`,

    - `Database`.

- **--object-name** (*string*) -

    **[REQUIRED]**

    指定对象名称。您可以使用 `'*'` 来包含指定类型的所有对象。

- **--privilege** (*string*) -

    **[REQUIRED]**

    指定权限名称。您可以使用 `'*'` 来包含所有权限。可用权限列于[Privileges and Privilege Groups](/docs/cluster-privileges)。

- **--database** (*string*) -

    指定数据库名称。

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

    指定用于筛选输出的 JMESPath 表达式。

## Example\{#example}

```bash
# Grant search on a specific collection
zilliz role grant-privilege --role my_role --object-type Collection --object-name my_col --privilege Search

# Grant all privileges on all collections
zilliz role grant-privilege --role my_role --object-type Collection --object-name '*' --privilege '*'
```
