---
title: "LoadCollection() | Cloud"
slug: /cpp/cpp/Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションデータをクエリノードのCPUとメモリにロードします。リクエストが同期モードの場合、この操作はコレクションのロード進行状況を確認し、コレクションが完全にクエリノードにロードされるまで待機します。それ以外の場合は、すぐに返ります。 | Cloud"
type: docx
token: Z3KTdzp7xoWm7QxytFGcIqYangm
sidebar_position: 16
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - ベクトル search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - LoadCollection()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadCollection()

この操作は、コレクションデータをクエリノードのCPUとメモリにロードします。リクエストが同期モードの場合、この操作はコレクションのロード進行状況を確認し、コレクションが完全にクエリノードにロードされるまで待機します。それ以外の場合は、すぐに返ります。

```c++
Status LoadCollection(const LoadCollectionRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = LoadCollectionRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithSync(sync)
    .WithReplicaNum(replica_num)
    .WithTimeoutMs(timeout_ms)
    .WithRefresh(refresh)
    .WithLoadFields(load_fields)
    .WithSkipDynamicField(skip_dynamic_field)
    .WithTargetResourceGroups(target_resource_groups);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクション名を設定します。

- `WithSync(bool sync)`

    同期モードを設定します。デフォルト値は **True** です。

    - **True**: コレクションが完全にロードされるまで待機します。

    - **False**: コレクションのロード完了に関わらず、すぐに戻ります。

- `WithReplicaNum(int64_t replica_num)`

    レプリカ数を設定します。

- `WithTimeoutMs(int64_t timeout_ms)`

    タイムアウトをミリ秒単位で設定します。デフォルト値は 60000 ms です。このパラメーターは、同期モードでのみ有効です。

    `WaitFlushedMs` が 0 の場合、コレクションがメモリに完全にロードされるまで `GetLoadingProgress()` を繰り返し呼び出してロード状態を確認します。`WaitFlushedMs` が 0 より大きい場合、指定時間後にループを終了し、タイムアウトを示すステータスを返します。

- `WithRefresh(bool refresh)`

    リフレッシュオプションを設定します。デフォルト値は **False** です。このパラメーターは、バルクインポートインターフェースにより新しいセグメントが生成された場合に有効になります。

    - **True**: バルクインポートインターフェースで新しく生成されたセグメントをロードします。

    - **False**: バルクインポートインターフェースで新しく生成されたセグメントを無視します。

- `WithLoadFields(const std::set<std::string>& load_fields)`

    ロード対象のフィールドを設定します。

- `AddLoadField(const std::string& field_name)`

    ロード対象のフィールドを追加します。

- `WithSkipDynamicField(bool skip_dynamic_field)`

    動的フィールドのロードをスキップするかどうかを指定します。デフォルト値は **False** です。

- `WithTargetResourceGroups(const std::set<std::string>& target_resource_groups)`

    対象のリソースグループを設定します。

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

status = client->LoadCollection(
    milvus::LoadCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
