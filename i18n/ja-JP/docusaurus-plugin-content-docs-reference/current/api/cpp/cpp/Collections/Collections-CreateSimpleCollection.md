---
title: "CreateSimpleCollection() | Cloud"
slug: /cpp/cpp/Collections-CreateSimpleCollection
sidebar_label: "CreateSimpleCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "プライマリフィールドとベクトルフィールドを持つシンプルなコレクションを作成します。 | Cloud"
type: docx
token: HWQYdK1lIoLiQGxaqMkc2ZeOnge
sidebar_position: 15
keywords: 
  - ナレッジベース
  - 自然言語処理
  - AIチャットボット
  - コサイン距離
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSimpleCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateSimpleCollection()

プライマリフィールドとベクトルフィールドを持つシンプルなコレクションを作成します。

```c++
Status CreateSimpleCollection(const CreateSimpleCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CreateSimpleCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPrimaryFieldName(primary_field_name)
    .WithPrimaryFieldType(primary_field_type)
    .WithVectorFieldName(vector_field_name)
    .WithDimension(dimension)
    .WithConsistencyLevel(level)
    .WithMetricType(metric_type)
    .WithAutoID(auto_id)
    .WithEnableDynamicField(enable_dynamic_field)
    .WithMaxLength(max_length);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithPrimaryFieldName(const std::string& primary_field_name)`

    プライマリフィールド名を設定します。デフォルト値は "id" です。

- `WithPrimaryFieldType(DataType primary_field_type)`

    プライマリフィールドのデータ型を設定します。デフォルト値は INT64 です。

- `WithVectorFieldName(const std::string& vector_field_name)`

    ベクトルフィールドの名前を設定します。デフォルト値は「ベクトル」です。

- `WithDimension(int64_t dimension)`

    ベクトルフィールドの次元数を設定します。デフォルト値は 0 です。次元数には 0 以外の値を指定する必要があります。

- `WithConsistencyLevel(milvus::[ConsistencyLevel](./Collections-ConsistencyLevel) level)`

    コレクションの整合性レベルを設定します。デフォルト値は BOUNDED です。

- `WithMetricType(milvus::[MetricType](./Management-MetricType) metric_type)`

    コレクションのメトリックタイプを設定します。デフォルト値は COSINE です。

- `WithAutoID(bool auto_id)`

    自動 ID 生成フラグを設定します。デフォルト値は false です。

- `WithEnableDynamicField(bool enable_dynamic_field)`

    動的フィールドの有効化フラグを設定します。デフォルト値は true です。

- `WithMaxLength(int64_t max_length)`

    プライマリフィールドが VARCHAR の場合、その最大長を設定します。デフォルト値は 65535 です。

**戻り値:**

*Status*

`status.IsOk()` を確認して成功を判定します。

**例外:**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を参照してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateCollection(milvus::CreateSimpleCollectionRequest()
                                      .WithCollectionName(collection_name)
                                      .WithPrimaryFieldName(field_id)
                                      .WithVectorFieldName(field_vector)
                                      .WithDimension(dimension));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
