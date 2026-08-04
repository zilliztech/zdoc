---
title: "create | Cloud"
slug: /cli/cli/Role-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于创建新角色。 | Cloud"
type: docx
token: V9xIdjMEMowIh2xVJUUcvir6nUf
sidebar_position: 1
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
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

此操作用于创建新角色。

## 描述\{#description}

Zilliz Cloud 提供集群角色，供您在集群级别实施访问控制。详情请参阅[访问控制说明](/docs/access-control-overview)。

<Admonition type="info" icon="📘" title="说明">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在不同集群之间切换。

</Admonition>

## 概要\{#synopsis}

```bash
zilliz role create
--role <value>
[--output <json | table | text | yaml | csv]
[--no-header]
[--query <value>]
[--database <value>]
```

## 选项\{#options}

- **--role** (*string*) -

    **[必需]**

    指定角色名称。

    该值应为长度不超过 **255** 个字符的字符串，并且必须**以下划线 (_) 或字母开头**。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--database** (*string*) -

    指定数据库名称。默认值为 `default`。

## 示例\{#example}

```bash
zilliz role create --role my_role
```
