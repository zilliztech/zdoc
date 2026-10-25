---
title: "describe | Cloud"
slug: /cli/cli/Role-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会获取角色的详情和权限。 | Cloud"
type: docx
token: Fj9Yd4SOPoppxTx7K8WcyMd7ncd
sidebar_position: 2
keywords: 
  - 什么是向量数据库
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - 云
  - describe
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# describe

此操作会获取角色的详情和权限。

<Admonition type="info" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz role describe
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

**选项：**

- **--role**（*string*）-

    **[必需]**

    指示角色名称。

- **--output, -o**（*string*）-

    指示输出格式。可选值为：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header**（*boolean*）-

    指示当输出设置为 `table` 或 `csv` 时是否省略表头行。

- **--query, -q**（*string*）-

    指示用于筛选输出的 JMESPath 表达式。

- **--database**（*string*）-

    指示 Database 名称。该值默认为 `default`。

## 示例\{#example}

```bash
zilliz role describe --role my_role
```
