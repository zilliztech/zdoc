---
title: "ListPersistentSegments() | Cloud"
slug: /cpp/cpp/Management-ListPersistentSegments
sidebar_label: "ListPersistentSegments()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、データノードから永続化されたセグメントの情報を取得します。 | Cloud"
type: docx
token: XhwtdeOEmoyc9YxuVpqck1ejnNe
sidebar_position: 14
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - ListPersistentSegments()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListPersistentSegments()

この操作は、データノードから永続化されたセグメントの情報を取得します。

```c++
Status ListPersistentSegments(const ListPersistentSegmentsRequest& request, ListPersistentSegmentsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = ListPersistentSegmentsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(name);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& name)`

    コレクション名を設定します。

**戻り値:**

*Status* および *ListPersistentSegmentsResponse*

`status.IsOk()` を確認して、成功したかどうかを判定します。

レスポンスの `Segments()` リストには `SegmentInfo` の値が含まれます。各 `SegmentInfo` の値には、セグメントID、コレクションID、パーティションID、行数、状態に加え、コレクション名、セグメントレベル、ストレージバージョン、ソート状態が含まれます。

**SegmentLevel の値:**

- `UNKNOWN = -1`

- `LEGACY = 0`

- `L0 = 1`

- `L1 = 2`

- `L2 = 3`

**SegmentInfo のメソッド:**

- `const std::string& CollectionName() const`

    コレクション名を返します。

- `SegmentLevel Level() const`

    セグメントレベルを返します。

- `int64_t StorageVersion() const`

    ストレージバージョンを返します。

- `bool IsSorted() const`

    セグメントがソート済みかどうかを返します。

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

milvus::ListPersistentSegmentsResponse response;
status = client->ListPersistentSegments(
    milvus::ListPersistentSegmentsRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Segment count: " << response.Segments().size() << std::endl;
```
