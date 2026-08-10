---
title: "ResultSet | Go | v2"
slug: /go/go/v2-Vector-ResultSet
sidebar_label: "ResultSet"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "包含搜索或查询结果，包括匹配的 Entity ID、分数和字段值。 | Go | v2"
type: docx
token: CCWrdPlSao0pOTx9oIgcA64Nnjd
sidebar_position: 15
keywords: 
  - 混合向量搜索
  - 视频去重
  - 视频相似度搜索
  - 向量检索
  - zilliz
  - zilliz cloud
  - cloud
  - ResultSet
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ResultSet

包含搜索或查询结果，包括匹配的 Entity ID、分数和字段值。

```go
type ResultSet struct {
    ResultCount int
    GroupByValue column.Column
    IDs column.Column
    Fields DataSet
    Scores []float32
    Recall float32
    Err error
}
```

**字段：**

- **ResultCount** (*int*)

    返回的条目数

- **GroupByValue** (*column.Column*)

    用于分组结果的 group-by 列。

- **IDs** (*column.Column*)

    自动生成的 ID，可映射到 `Insert` API 返回的列

- **Fields** (*DataSet*)

    输出字段数据

- **Scores** (*[]float32*)

    到目标向量的距离

- **Recall** (*float32*)

    查询向量搜索结果的召回率（由 zilliz cloud 估算）

- **Err** (*error*)

    搜索错误（如果有）

**方法：**

- `GetColumn(fieldName string) column.Column`

    GetColumn 返回具有指定字段名称的列。

- `Len() int`

    返回结果数量。

- `Slice(start, end int) ResultSet`

    返回指定范围内的结果子集。
