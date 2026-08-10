---
title: "create | Cloud"
slug: /cli/cli/Role-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个新角色。 | Cloud"
type: docx
token: V9xIdjMEMowIh2xVJUUcvir6nUf
sidebar_position: 1
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
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

此操作会创建一个新角色。

## 说明\{#description}

Zilliz Cloud 提供集群角色，供您在集群级别实现访问控制。详情请参阅 [访问控制说明](/docs/access-control-overview)。

<Admonition type="info" icon="📘" title="Notes">

此命令仅适用于 Dedicated 集群。您可以运行 `zilliz context set` 在集群之间切换。

</Admonition>

## 概述\{#synopsis}

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

    该值应为一个长度不超过 **255** 个字符的字符串，且**以下划线 (_) 或字母开头**。

- **--output, -o** (*string*) -

    指定输出格式。可能的值包括：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

- **--database** (*string*) -

    指定 Database 名称。该值默认为 `default`。

## 示例\{#example}

```bash
zilliz role create --role my_role
```
