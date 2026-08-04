---
title: "describe | Cloud"
slug: /cli/cli/Role-describe
sidebar_label: "describe"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取角色的详细信息和权限。 | Cloud"
type: docx
token: Fj9Yd4SOPoppxTx7K8WcyMd7ncd
sidebar_position: 2
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - describe
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# describe

此操作获取角色的详细信息和权限。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。你可以运行 `zilliz context set` 在集群之间切换。

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

- **--role** (*string*) -

    **[必需]**

    表示角色名称。

- **--output, -o** (*string*) -

    表示输出格式。可选值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

- **--database** (*string*) -

    表示数据库名称。默认值为 `default`。

## 示例\{#example}

```bash
zilliz role describe --role my_role
```
