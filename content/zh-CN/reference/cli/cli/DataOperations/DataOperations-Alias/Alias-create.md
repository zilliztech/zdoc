---
title: "create | Cloud"
slug: /cli/cli/Alias-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个指向 Collection 的别名。 | Cloud"
type: docx
token: WxTjdBaBqoNhRex5kR0cfekqnOc
sidebar_position: 2
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
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

此操作会创建一个指向 Collection 的别名。

## 说明\{#description}

您可以为 Collection 分配一个别名，并通过该别名执行搜索/queries，从而由关联的 Collection 响应。使用此命令可更改与指定别名关联的 Collection。

运行此命令时，如果未提供任何提示信息，将触发一组交互式提示来帮助您完成设置。

## 概要\{#synopsis}

```bash
zilliz alias create
--collection <value>
--alias <value>
[--database <value>]
[--output <json | table | text | yaml | csv>]
[--no-header]
[--query <value>]
```

## 选项\{#options}

- **--collection** (*string*) -

    **[必需]**

    表示目标 Collection 名称。

- **--alias** (*string*) -

    **[必需]**

    表示别名名称。

    该值应为最多 **255** 个字符的字母数字字符串，并以下划线 (_) 或字母开头。

- **--database** (*string*) -

    表示 Database 名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的 Database。

- **--output, -o** (*string*) -

    表示输出格式。可能的值包括：

    - `json`，

    - `table`，

    - `text`，

    - `yaml`，

    - `csv`。

- **--no-header** (*boolean*) -

    表示当输出设置为 `table` 或 `csv` 时，是否省略标题行。

- **--query, -q** (*string*) -

    表示用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz alias create --collection my_collection --alias my_alias
```
