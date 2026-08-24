---
title: "CreateIndex() | Cloud"
slug: /cpp/cpp/Management-CreateIndex
sidebar_label: "CreateIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ベクトルフィールドまたはスカラーフィールドにインデックスを作成します。 | Cloud"
type: docx
token: J7Yxdgw6moJca1xZCe7cLOIunve
sidebar_position: 3
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - CreateIndex()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateIndex()

この操作は、ベクトルフィールドまたはスカラーフィールドにインデックスを作成します。

```c++
Status CreateIndex(const CreateIndexRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateIndexRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithIndexes(indexes)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithIndexes(std::ベクトル<IndexDesc>&& インデックス)`

    作成するインデックスを設定します。

- `AddIndex(IndexDesc&& index)`

    作成するインデックスを追加します。

- `WithSync(bool sync)`

    同期モードで実行するかどうかを設定します。デフォルト値は **True** です。

    - **True**: インデックスの作成が完了するまで待機してから戻ります。

    - **False**: 即座に戻ります。

- `WithTimeoutMs(int64_t timeout_ms)`

    タイムアウトをミリ秒単位で設定します。デフォルト値は 60000 ms です。このパラメータは同期モードでのみ有効です。

    `WaitFlushedMs` が 0 に設定されている場合、この操作はインデックスが完全に構築されるまで `DescribeIndex()` を繰り返し呼び出してインデックスの状態を確認します。`WaitFlushedMs` が 0 より大きい場合、この操作は指定された期間後にループを中断し、タイムアウトを示すステータスを返します。

**戻り値:**

*Status*

`status.IsOk()` を確認して成功を判定します。

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

milvus::IndexDesc index_vector("vector_field_name", "vector_index_name", milvus::IndexType::HNSW,
                               milvus::MetricType::L2);
index_vector.AddExtraParam("M", "32");
index_vector.AddExtraParam("efConstruction", "100");

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName(collection_name)
                                 .WithSync(true)
                                 .AddIndex(std::move(index_vector)));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
