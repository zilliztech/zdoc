---
title: "Compact() | Cloud"
slug: /cpp/cpp/Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、手動で Compaction をトリガーします。通常は Milvus が内部で自動的に Compaction を実行するため、この操作を行う必要はありません。主にメンテナンスやデバッグの目的で使用します。 | Cloud"
type: docx
token: ZidndgXjGoLam3xqLOOcmFTYnBh
sidebar_position: 2
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
  - zilliz
  - zilliz cloud
  - cloud
  - Compact()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Compact()

この操作は、手動で Compaction をトリガーします。通常は Milvus が内部で自動的に Compaction を実行するため、この操作を行う必要はありません。主にメンテナンスやデバッグの目的で使用します。

```c++
Status Compact(const CompactRequest& request, CompactResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CompactRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithClusteringCompaction(clustering_compaction)
    .WithTargetSize(target_size);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithClusteringCompaction(bool clustering_compaction)`

    クラスタリング Compaction フラグを設定します。

    - **True**: クラスタリング Compaction を実行します。クラスタリングキーが存在しない場合はエラーになります。

    - **False**: 通常の Compaction を実行します。

- `WithTargetSize(int64_t target_size)`

    Compaction プランニングにおけるターゲットセグメントサイズをバイト単位で設定します。0 より大きい値を指定すると、出力セグメントのサイズの目安として使用されます。

**戻り値:**

*CompactResponse* を含む *Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

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

milvus::CompactResponse response;
status = client->Compact(
    milvus::CompactRequest()
        .WithCollectionName("my_collection"),
    response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "Compaction ID: " << response.CompactionID() << std::endl;
```
