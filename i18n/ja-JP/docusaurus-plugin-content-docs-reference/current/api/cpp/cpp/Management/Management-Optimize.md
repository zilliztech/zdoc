---
title: "Optimize() | Cloud"
slug: /cpp/cpp/Management-Optimize
sidebar_label: "Optimize()"
beta: false
added_since: v2.6.3
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、保留中のインデックス構築を待機し、要求されたターゲットセグメントサイズに向けて Compaction を実行し、コレクションがロードされている場合はロード状態を更新することで、コレクションのセグメントを最適化します。async オプションを指定すると、処理は OptimizeTask ハンドルを介して公開されるバックグラウンドタスクで実行され、最終結果を返します。 | Cloud"
type: docx
token: NlpedMAt2of5d6xPHvucRSzjnVe
sidebar_position: 20
keywords: 
  - Hierarchical Navigable Small Worlds
  - 密な埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - zilliz
  - zilliz cloud
  - クラウド
  - Optimize()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# Optimize()

この操作は、保留中のインデックス構築を待機し、要求されたターゲットセグメントサイズに向けて Compaction を実行し、コレクションがロードされている場合はロード状態を更新することで、コレクションのセグメントを最適化します。async オプションを指定すると、処理は OptimizeTask ハンドルを介して公開されるバックグラウンドタスクで実行され、最終結果を返します。

```c++
Status Optimize(const OptimizeRequest& request, OptimizeTaskPtr& task)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size)
    .WithAsync(async)
    .WithTimeoutMs(timeout_ms);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベースの名前を設定します。空の場合は、デフォルトのデータベースが使用されます。

- `WithCollectionName(const std::string& collection_name)`

    最適化するコレクションの名前を設定します。この値は空にできません。

- `WithTargetSize(const std::string& target_size)`

    最適化のターゲットセグメントサイズを設定します。たとえば、"512MB" や "1GB" などです。

- `WithAsync(bool async)`

    最適化を非同期で実行するかどうかを設定します。true の場合、Optimize() はバックグラウンドタスクの開始直後に戻ります。false の場合、呼び出しは最適化が完了するまでブロックされます。

- `WithTimeoutMs(int64_t timeout_ms)`

    タスク全体のタイムアウトをミリ秒単位で設定します。0 は全体のタイムアウトなしを意味します。

**戻り値:**

*Status*

操作が成功したかどうかを示す Status を返します。同期モードでは、最適化の実行全体の結果を反映します。非同期モードでは、バックグラウンドタスクが開始されたかどうかを示し、その最終ステータスは OptimizeTask ハンドルを通じて取得できます。

- **response** (*OptimizeTaskPtr*) -

    - **GetResult** (*Status*) -

        タスクの結果を待機します。タイムアウトが 0 の場合は、無期限に待機します。

        - **StatusText** (*const std::string&*) -

            ステータステキストを取得します。

        - **CollectionName** (*const std::string&*) -

            コレクション名を取得します。

        - **CompactionID** (*int64_t*) -

            Compaction ID を取得します。

        - **TargetSize** (*const std::string&*) -

            正規化されたターゲットサイズを取得します。

        - **ProgressHistory** (*const std::ベクトル&lt;std::string&gt;&*) -

            進行状況の履歴を取得します。

    - **Cancel** (*bool*) -

        タスクを協調的にキャンセルします。

    - **IsDone** (*bool*) -

        タスクが完了したかどうか。

    - **IsCancelled** (*bool*) -

        タスクがキャンセルされたかどうか。

    - **CurrentProgress** (*std::string*) -

        現在の進行状況メッセージ。

    - **ProgressHistory** (*std::ベクトル&lt;std::string&gt;*) -

        進行状況メッセージの履歴。

    - **TaskStatus** (*Status*) -

        完了している場合は最終的なタスクステータス、それ以外の場合は OK。

**エラーハンドリング:**

- **std::exception**

    リクエストの構築、トランスポート、またはレスポンスの処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

接続済みの MilvusClientV2 で Optimize() を呼び出し、コレクションのセグメントをターゲットサイズに向けて Compaction します。最終結果は OptimizeTask ハンドルを使用して取得します。

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize(target_size);
status = client->Optimize(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
