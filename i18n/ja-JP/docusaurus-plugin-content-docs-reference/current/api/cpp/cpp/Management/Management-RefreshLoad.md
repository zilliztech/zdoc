---
title: "RefreshLoad() | Cloud"
slug: /cpp/cpp/Management-RefreshLoad
sidebar_label: "RefreshLoad()"
beta: false
added_since: v2.6.3
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、QueryNode メモリ上のロード済みコレクションをリフレッシュします。大量のデータ取り込みや Compaction の実行後、ロード済みデータのビューを即座に最新状態に反映したい場合に使用します。 | Cloud"
type: docx
token: YI1BdnZOMoPSOMxjVMEcrrCwnWh
sidebar_position: 19
keywords: 
  - ベクトル類似検索
  - 近似最近傍探索
  - DiskANN
  - スパースベクトル
  - zilliz
  - zilliz cloud
  - cloud
  - RefreshLoad()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RefreshLoad()

この操作は、QueryNode メモリ上のロード済みコレクションをリフレッシュします。大量のデータ取り込みや Compaction の実行後、ロード済みデータのビューを即座に最新状態に反映したい場合に使用します。

```c++
Status RefreshLoad(const RefreshLoadRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = RefreshLoadRequest()
    .WithCollectionName(collection_name)
    .WithSync(sync)
    .WithTimeoutMs(timeout_ms);
```

### RefreshLoadRequest\{#refreshloadrequest}

**リクエストメソッド:**

- `WithCollectionName(const std::string& collection_name)`

    リフレッシュ対象のコレクション名を設定します。

- `WithDatabaseName(const std::string& db_name)`

    対象のデータベースを設定します。省略時はデフォルトデータベースが使用されます。

- `WithSync(bool sync)`

    リフレッシュ完了まで呼び出しをブロックするかどうかを制御します。デフォルトは `true` です。

- `WithTimeoutMs(int64_t timeout_ms)`

    同期リフレッシュのタイムアウトをミリ秒単位で設定します。デフォルトは `60000` です。

**戻り値:**

*Status*

**例外:**

- **StatusCode**

    無効なコレクション名、ロード状態の問題、またはタイムアウトによる失敗が発生した場合は、`status.Code()` および `status.Message()` を確認してください。

## 例\{#example}

```c++
#include <milvus/MilvusClientV2.h>
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->RefreshLoad(
    milvus::RefreshLoadRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .WithTimeoutMs(60000));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
