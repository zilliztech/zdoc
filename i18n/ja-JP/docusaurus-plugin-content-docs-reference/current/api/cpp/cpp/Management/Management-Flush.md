---
title: "Flush() | Cloud"
slug: /cpp/cpp/Management-Flush
sidebar_label: "Flush()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作はストリーミングデータをフラッシュし、セグメントをシールします。コレクションへのデータ挿入がすべて完了した後に呼び出すことを推奨します。 | Cloud"
type: docx
token: Ya3cdJkTNoGyqYxTXPMccOd8nun
sidebar_position: 7
keywords: 
  - Sparse vs Dense
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - Flush()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# Flush()

この操作はストリーミングデータをフラッシュし、セグメントをシールします。コレクションへのデータ挿入がすべて完了した後に呼び出すことを推奨します。

```c++
Status Flush(const FlushRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = FlushRequest()
    .WithDatabaseName(db_name)
    .WithCollectionNames(names)
    .WithWaitFlushedMs(ms);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベース名を設定します。空の場合はデフォルトのデータベースが適用されます。

- `WithCollectionNames(std::set<std::string>&& names)`

    コレクション名を設定します。

- `AddCollectionName(const std::string& name)`

    フラッシュ対象のコレクション名を追加します。

- `WithWaitFlushedMs(int64_t ms)`

    フラッシュ処理の完了を待機する時間をミリ秒単位で設定します。デフォルト値は 0 です。`WaitFlushedMs` が 0 の場合、この操作は `GetFlushState()` を繰り返し呼び出して関連セグメントのステータスを確認し、すべてのセグメントがフラッシュされるまで待機することで、バッファーの永続化を保証します。`WaitFlushedMs` が 0 より大きい場合、指定時間経過後にループを終了し、タイムアウトを示すステータスを返します。

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

// call flush() here just to persist the data so that indexnode can build index on a new segment
// Note: in practice, no need to call flush() manually since milvus automatically trigger flush actions
status = client->Flush(milvus::FlushRequest().AddCollectionName(collection_name));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
