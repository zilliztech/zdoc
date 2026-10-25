---
title: "LoadCollection() | Cloud"
slug: /cpp/cpp/Management-LoadCollection
sidebar_label: "LoadCollection()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションのデータをクエリノードの CPU とメモリに読み込みます。リクエストが同期モードの場合、この操作はコレクションのロード進捗を確認し、コレクションがクエリノードに完全に読み込まれるまで待機します。それ以外の場合は、すぐに戻ります。 | Cloud"
type: docx
token: TqIzdhIkFoR8KYxBXfscml0Ln8c
sidebar_position: 18
keywords: 
  - NLP 検索
  - LLM ハルシネーション
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - zilliz
  - Zilliz Cloud
  - クラウド
  - LoadCollection()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# LoadCollection()

この操作は、コレクションのデータをクエリノードの CPU とメモリに読み込みます。リクエストが同期モードの場合、この操作はコレクションのロード進捗を確認し、コレクションがクエリノードに完全に読み込まれるまで待機します。それ以外の場合は、すぐに戻ります。

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
    .WithTargetResourceGroups(target_resource_groups)
    .WithLoadPriority(load_priority);
```

**リクエストメソッド：**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionName(const std::string& collection_name)`

    対象のコレクションの名前を設定します。

- `WithSync(bool sync)`

    同期モードを設定します。デフォルト値は **True** です。

    - **True**: コレクションが完全に読み込まれるまで待機します。

    - **False**: コレクションが完全に読み込まれたかどうかに関係なく、すぐに戻ります。

- `WithReplicaNum(int64_t replica_num)`

    レプリカ数を設定します。

- `WithTimeoutMs(int64_t timeout_ms)`

    タイムアウトをミリ秒単位で設定します。デフォルト値は 60000 ms です。このパラメーターは、この操作が同期モードで動作する場合にのみ有効です。

    `WaitFlushedMs` が 0 に設定されている場合、この操作はコレクションがメモリに完全に読み込まれるまで、ロード状態を確認するために `GetLoadingProgress()` を繰り返し呼び出します。`WaitFlushedMs` が 0 より大きい場合、この操作は指定された期間後にループを抜け、タイムアウトを示すステータスを返します。

- `WithRefresh(bool refresh)`

    リフレッシュオプションを設定します。デフォルト値は **False** です。このパラメーターは、一括インポートインターフェースによって新しいセグメントが生成された場合に適用されます。

    - **True**: 一括インポートインターフェースから新しく生成されたセグメントを読み込みます。

    - **False**: 一括インポートインターフェースから新しく生成されたセグメントを無視します。

- `WithLoadFields(const std::set<std::string>& load_fields)`

    ロードするフィールドを設定します。

- `AddLoadField(const std::string& field_name)`

    ロードするフィールドを追加します。

- `WithSkipDynamicField(bool skip_dynamic_field)`

    動的フィールドのロードをスキップするかどうかです。デフォルト値は **False** です。

- `WithTargetResourceGroups(const std::set<std::string>& target_resource_groups)`

    対象のリソースグループを設定します。

- `WithLoadPriority(const std::string& load_priority)`

    コレクションのロード優先度を設定します。低優先度を選択するには `"low"` を設定します。その他の値（`"high"` を含む）はすべてデフォルトで高優先度になります。

**戻り値：**

*Status*

成功したことを確認するには、`status.IsOk()` を確認してください。

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

status = client->LoadCollection(
    milvus::LoadCollectionRequest()
        .WithCollectionName(collection_name)
);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
