---
title: "create | Cloud"
slug: /cli/cli/User-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建新的数据库用户。 | Cloud"
type: docx
token: UJuOdGGu3okE0Sx1jARc45lMnGb
sidebar_position: 1
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作用于创建新的数据库用户。

## Description\{#description}

在 Zilliz Cloud 中，您可以创建集群用户并为其分配集群角色，以定义相应权限，从而实现数据安全。

创建集群时，系统会自动创建一个名为 `db_admin` 的默认用户。此用户无法被删除。除了该默认用户之外，您还可以创建更多集群用户，以实现更细粒度的访问控制。

要管理集群用户，您必须是 **Organization Owner**、**Project Admin**，或拥有 **Cluster_Admin** 权限的角色。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在不同集群之间切换。

</Admonition>

## Synopsis\{#synopsis}

```bash
zilliz user create
--user <value>
--password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## Options\{#options}

- **--user** (*string*) -

    **[REQUIRED]**

    指定用户名。

    该值应为长度不超过 **32** 个字符的字符串，并且必须**以下划线 (_) 或字母开头**。

- **--password** (*string*) -

    **[REQUIRED]**

    指定密码。

    密码应为至少 **8** 个字符的字符串，并且包含以下选项中的 **两** 种类型：

    - 大写字母 (A-Z)

    - 小写字母 (a-z)

    - 数字 (0-9)

    - 特殊字符（如 `!`、`@`、`#` 等）

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

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
zilliz user create --user my_user --password my_password
```
