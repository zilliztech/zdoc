---
title: "Optimize() | Cloud"
slug: /cpp/cpp/Management-Optimize
sidebar_label: "Optimize()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションの最適化 Compaction をトリガーし、ポーリング、キャンセル、待機が可能な非同期タスクハンドルを返します。 | Cloud"
type: docx
token: NlpedMAt2of5d6xPHvucRSzjnVe
sidebar_position: 18
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss ベクトル データベース
  - Chroma ベクトル データベース
  - zilliz
  - zilliz cloud
  - cloud
  - Optimize()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Optimize()

この操作は、コレクションの最適化 Compaction をトリガーし、ポーリング、キャンセル、待機が可能な非同期タスクハンドルを返します。

```c++
Status Optimize(const OptimizeRequest& request, OptimizeTaskPtr& task)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = OptimizeRequest()
    .WithDatabaseName(db_name)
    .WithCollectionName(collection_name)
    .WithTargetSize("512MB")
    .WithAsync(true)
    .WithTimeoutMs(0);
```

### OptimizeRequest\{#optimizerequest}

**リクエスト メソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベースを設定します。

- `WithCollectionName(const std::string& collection_name)`

    最適化の対象となるコレクションを設定します。

- `WithTargetSize(const std::string& target_size)`

    Compaction 後の目標セグメント サイズ（例: `"512MB"` や `"1GB"`）を設定します。

- `WithAsync(bool async)`

    `true` の場合、最適化は非同期でスケジュールされます。

- `WithTimeoutMs(int64_t timeout_ms)`

    タスク全体のタイムアウトをミリ秒単位で設定します。`0` はタイムアウトなしを意味します。

**戻り値:**

*Status* および *OptimizeTaskPtr*

### OptimizeResponse\{#optimizeresponse}

このクラスは、正規化されたターゲット サイズ、Compaction ID、進行状況の履歴を含む最適化タスクの出力を表します。

```c++
const OptimizeResponse& response = resp;
```

**メソッド:**

- `const std::string& StatusText() const`

    最適化実行中に報告された現在のステータス テキストを返します。

- `const std::string& CollectionName() const`

    最適化対象のコレクションを返します。

- `int64_t CompactionID() const`

    Compaction タスク ID を返します。

- `const std::string& TargetSize() const`

    オプティマイザーが使用する正規化済みターゲット サイズを返します。

- `const std::ベクトル<std::string>& ProgressHistory() const`

    タスク実行中に収集された進行状況メッセージを返します。

### OptimizeTask\{#optimizetask}

このクラスは、キャンセル、待機、進行状況の問い合わせが可能な非同期最適化タスクを表します。

```c++
const OptimizeTaskPtr& task = optimize_task;
```

**メソッド:**

- `Status GetResult(OptimizeResponse& response, int64_t timeout_ms = 0)`

    完了を待機し、`response` に結果を設定します。`timeout_ms = 0` は無期限に待機します。

- `bool Cancel()`

    タスクの協調的キャンセルを要求します。

- `bool IsDone() const`

    タスクの実行が完了したかどうかを返します。

- `bool IsCancelled() const`

    キャンセルが要求され、受理されたかどうかを返します。

- `std::string CurrentProgress() const`

    最新の進行状況メッセージを返します。

- `std::ベクトル<std::string> ProgressHistory() const`

    記録されたすべての進行状況メッセージを返します。

- `Status TaskStatus() const`

    完了時は最終的なタスク ステータスを返し、それ以外の場合は OK ステータスを返します。

**例外:**

- **StatusCode**

    無効なリクエスト パラメーター、最適化のスケジュール失敗、またはタイムアウト エラーが発生した場合は、`status.Code()` と `status.Message()` を確認してください。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::OptimizeTaskPtr task;
status = client->Optimize(
    milvus::OptimizeRequest()
        .WithCollectionName("my_collection")
        .WithTargetSize("512MB")
        .WithAsync(true),
    task);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::OptimizeResponse response;
status = task->GetResult(response, 60000);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
