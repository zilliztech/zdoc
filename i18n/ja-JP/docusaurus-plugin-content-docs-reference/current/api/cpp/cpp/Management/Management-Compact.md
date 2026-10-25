---
title: "Compact() | Cloud"
slug: /cpp/cpp/Management-Compact
sidebar_label: "Compact()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、Compaction を手動でトリガーします。通常は、Milvus が内部で自動的に Compaction をトリガーするため、この操作を実行する必要はありません。主にメンテナンスやデバッグの目的で使用します。 | Cloud"
type: docx
token: A1ePdfCEZo4ZX1xqZtVcKUcxnfE
sidebar_position: 2
keywords: 
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルDB比較
  - zilliz
  - zilliz cloud
  - クラウド
  - Compact()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Compact()

この操作では、Compaction を手動でトリガーします。通常は、Milvus が内部で自動的に Compaction をトリガーするため、この操作を実行する必要はありません。主にメンテナンスやデバッグの目的で使用します。

```c++
Status Compact(const CompactRequest& request, CompactResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = CompactRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithClusteringCompaction(clustering_compaction)
    .WithTargetSize(target_size)
    .WithTargetSizeUnit(unit)
    .WithIsL0(is_l0);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合は、デフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    コレクション名を設定します。

- `WithClusteringCompaction(bool clustering_compaction)`

    クラスタリング Compaction フラグを設定します。

    - **True**：クラスタリング Compaction を実行し、クラスタリングキーが存在しない場合はエラーを報告します。

    - **False**：通常の Compaction を実行します。

- `WithTargetSize(int64_t target_size)`

    Compaction プランニングのターゲットセグメントサイズをバイト単位で設定します。出力セグメントのサイズを設定する際の目安として、0 より大きい値を使用します。

- `WithTargetSizeUnit(const std::string& unit)`

    ターゲットセグメントサイズの単位を設定します。サポートされる値は `"b"`、`"kb"`、`"mb"`、`"gb"`、`"tb"`、`"pb"` です。デフォルトは `"mb"` です。

- `WithIsL0(bool is_l0)`

    L0 Compaction フラグを設定します。`true` の場合は L0 セグメントのみを対象に Compaction を実行し、`false` の場合は通常の Compaction を実行します。

**戻り値：**

*CompactResponse* を含む *Status*

`status.IsOk()` を確認して、成功したかどうかを判断します。

**例外：**

- **StatusCode**

    エラーの詳細については、`status.Code()` および `status.Message()` を確認してください。

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
