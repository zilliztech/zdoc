---
title: "revoke-privilege | Cloud"
slug: /cli/cli/Role-revokeprivilege
sidebar_label: "revoke-privilege"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会撤销角色的权限。 | Cloud"
type: docx
token: YXtHdG865oGg7IxwoZRcIJkQn8e
sidebar_position: 6
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - Zilliz
  - Zilliz Cloud
  - 云
  - revoke-privilege
  - cliv14
displayed_sidebar: cliSidebar

---

import Admonition from '@theme/Admonition';


# revoke-privilege

此操作会撤销角色的权限。

<Admonition type="info" title="Notes">

此命令仅适用于 Dedicated 集群。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz role revoke-privilege
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

    **[REQUIRED]**

    指示角色名称。

- **--object-type** (*string*) -

    **[REQUIRED]**

    指示对象类型。可选值：

    - `Global`，

    - `Collection`，

    - `Database`。

- **--object-name** (*string*) -

    **[REQUIRED]**

    指示对象名称（或使用 &ast; 表示全部）。

- **--privilege** (*string*) -

    **[REQUIRED]**

    指示权限名称。

- **--database** (*string*) -

    指示 Database 名称。

- **--output, -o** (*string*) -

    指示输出格式。可选值：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指示当输出设置为 `table` 或 `csv` 时是否省略标题行。

- **--query, -q** (*string*) -

    指示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz role revoke-privilege --role my_role --object-type Collection --object-name my_col --privilege Search
```
