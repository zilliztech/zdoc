---
title: "create | Cloud"
slug: /cli/cli/User-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建新的 Database 用户。 | Cloud"
type: docx
token: UJuOdGGu3okE0Sx1jARc45lMnGb
sidebar_position: 1
keywords: 
  - 相似度搜索
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - zilliz
  - zilliz cloud
  - 云
  - create
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# create

此操作会创建新的 Database 用户。

## 说明\{#description}

在 Zilliz Cloud 中，您可以创建集群用户并为其分配集群角色来定义权限，从而实现数据安全。

创建集群时，系统会自动创建一个名为 `db_admin` 的默认用户。该用户无法被删除。除该默认用户外，您还可以创建更多集群用户，以实现细粒度的访问控制。

要管理集群用户，您必须是 **Organization Owner** 或 **Project Admin**，或者拥有具有 **Cluster_Admin** 权限的角色。

<Admonition type="info" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz user create
--user <value>
--password <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--user**（*string*）-

    **[必需]**

    指示用户名。

    该值应为不超过 **32** 个字符的字符串，并以**下划线（_）或字母**开头。

- **--password**（*string*）-

    **[必需]**

    指示密码。

    密码应为至少包含 **8** 个字符的字符串，并且包含以下选项中的 **2** 种类型：

    - 大写字母（A-Z）

    - 小写字母（a-z）

    - 数字（0-9）

    - 特殊字符（`!`、`@`、`#` 等）

- **--output, -o**（*string*）-

    指示输出格式。可选值如下：

    - `json`

    - `table`

    - `text`

    - `yaml`

    - `csv`

- **--no-header**（*boolean*）-

    指示当输出设置为 `table` 或 `csv` 时是否省略表头行。

- **--query, -q**（*string*）-

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz user create --user my_user --password my_password
```
