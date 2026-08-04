---
title: "create | Cloud"
slug: /cli/cli/Alias-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个指向集合的别名。 | Cloud"
type: docx
token: WxTjdBaBqoNhRex5kR0cfekqnOc
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
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

此操作会创建一个指向集合的别名。

## 描述\{#description}

您可以为集合分配一个别名，并针对该别名执行搜索/查询，此时关联的集合会进行响应。使用此命令可更改与指定别名关联的集合。

在不带任何提示参数的情况下运行此命令，会触发一组交互式提示来帮助您完成设置。

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

    **[REQUIRED]**

    指定目标集合名称。

- **--alias** (*string*) -

    **[REQUIRED]**

    指定别名名称。

    该值应为不超过 **255** 个字符的字母数字字符串，并以下划线 (_) 或字母开头。

- **--database** (*string*) -

    指定数据库名称。

    如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群所属的数据库。

- **--output, -o** (*string*) -

    指定输出格式。可选值：

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`。

- **--no-header** (*boolean*) -

    指定当输出设置为 `table` 或 `csv` 时，是否省略表头行。

- **--query, -q** (*string*) -

    指定用于筛选输出的 JMESPath 表达式。

## 示例\{#example}

```bash
zilliz alias create --collection my_collection --alias my_alias
```
