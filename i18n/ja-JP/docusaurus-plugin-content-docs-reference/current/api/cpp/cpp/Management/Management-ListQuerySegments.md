---
title: "ListQuerySegments() | Cloud"
slug: /cpp/cpp/Management-ListQuerySegments
sidebar_label: "ListQuerySegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、クエリノードからロード済みセグメントの情報を取得します。 | Cloud"
type: docx
token: J946dq9upog3BoxXTaucrrqvn4g
sidebar_position: 15
keywords: 
  - Sparse vs Dense
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - ListQuerySegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListQuerySegments()

この操作は、クエリノードからロード済みセグメントの情報を取得します。

```c++
Status ListQuerySegments(const ListQuerySegmentsRequest& request, ListQuerySegmentsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListQuerySegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& name)`

    コレクション名を設定します。

**戻り値:**

*Status* および *ListQuerySegmentsResponse*

`status.IsOk()` を確認して、成功したかどうかを判定します。

レスポンスの `Segments()` リストには `QuerySegmentInfo` の値が含まれます。`QuerySegmentInfo` は `SegmentInfo` からセグメントメタデータのメソッドを継承しており、ロード済みセグメントのメモリサイズも取得できます。

**SegmentInfo のメソッド:**

- `const std::string& CollectionName() const`

    コレクション名を返します。

- `SegmentLevel Level() const`

    セグメントレベルを返します。

- `int64_t StorageVersion() const`

    ストレージバージョンを返します。

- `bool IsSorted() const`

    セグメントがソート済みかどうかを返します。

**QuerySegmentInfo のメソッド:**

- `int64_t MemSize() const`

    クエリセグメントのメモリサイズを返します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::ListQuerySegmentsResponse response;
status = client->ListQuerySegments(
    milvus::ListQuerySegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```
