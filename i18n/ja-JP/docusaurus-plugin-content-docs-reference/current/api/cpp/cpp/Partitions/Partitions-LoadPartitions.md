---
title: "LoadPartitions() | Cloud"
slug: /cpp/cpp/Partitions-LoadPartitions
sidebar_label: "LoadPartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクション内の指定したパーティションのデータをクエリノードにロードします。 | Cloud"
type: docx
token: I2fxdWeslorOwIxnv9ac0giWnps
sidebar_position: 6
keywords: 
  - ニューラルネットワーク
  - ディープラーニング
  - ナレッジベース
  - 自然言語処理
  - zilliz
  - zilliz cloud
  - cloud
  - LoadPartitions()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# LoadPartitions()

この操作は、コレクション内の指定したパーティションのデータをクエリノードにロードします。

```c++
Status LoadPartitions(const LoadPartitionsRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = LoadPartitionsRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithPartitionNames(partition_names)
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

    コレクション名を設定します。

- `WithPartitionNames(const std::set<std::string>& partition_names)`

    パーティション名を設定します。

- `AddPartitionName(const std::string& partition_name)`

    ロード対象のパーティションを追加します。

- `WithSync(bool sync)`

    同期モードを設定します。デフォルト値は **True** です。

    - **True**: コレクションが完全にロードされるまで待機します。

    - **False**: コレクションのロード完了に関係なく、すぐに戻ります。

- `WithReplicaNum(int64_t replica_num)`

    レプリカ数を設定します。

- `WithTimeoutMs(int64_t timeout_ms)`

    タイムアウトをミリ秒単位で設定します。デフォルト値は 60000 ms です。このパラメーターは、同期モードでのみ有効です。

    `WaitFlushedMs` が 0 の場合、コレクションがメモリに完全にロードされるまで `GetLoadingProgress()` を繰り返し呼び出してロード状態を確認します。`WaitFlushedMs` が 0 より大きい場合、指定時間後にループを終了し、タイムアウトを示すステータスを返します。

- `WithRefresh(bool refresh)`

    リフレッシュオプションを設定します。このパラメーターは、バルクインポートインターフェースにより新規セグメントが生成された場合に有効になります。

    - **True**: バルクインポートインターフェースで新たに生成されたセグメントをロードします。

    - **False**: バルクインポートインターフェースで新たに生成されたセグメントを無視します。

- `WithLoadFields(const std::set<std::string>& load_fields)`

    ロードするフィールド名を設定します。

- `AddLoadField(const std::string& load_field)`

    ロードするフィールド名を追加します。

- `WithSkipDynamicField(bool skip_dynamic_field)`

    動的フィールドオプションをスキップするかどうかを設定します。

- `WithTargetResourceGroups(const std::set<std::string>& target_resource_groups)`

    ターゲットリソースグループを設定します。空の場合、パーティションデータはデフォルトのリソースグループにロードされます。

- `AddTargetResourceGroups(const std::string& target_resource_group)`

    ターゲットリソースグループを追加します。

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

status = client->LoadPartitions(
    milvus::LoadPartitionsRequest()
        .WithCollectionName("my_collection")
        .AddPartitionName("partition_1")
        .AddPartitionName("partition_2")
        .WithSync(true));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
