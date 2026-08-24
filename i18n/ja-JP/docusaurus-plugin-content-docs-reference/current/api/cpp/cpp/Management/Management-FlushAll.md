---
title: "FlushAll() | Cloud"
slug: /cpp/cpp/Management-FlushAll
sidebar_label: "FlushAll()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、データベース内のすべてのコレクションの挿入バッファーをフラッシュします。データの永続化が必要なバックアップや検証ワークフローを実行する前に使用してください。 | Cloud"
type: docx
token: UbjxdApcFonLD4xmm9fcJI2knKd
sidebar_position: 21
keywords: 
  - milvus データベース
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - FlushAll()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FlushAll()

この操作は、データベース内のすべてのコレクションの挿入バッファーをフラッシュします。データの永続化が必要なバックアップや検証ワークフローを実行する前に使用してください。

```c++
Status FlushAll(const FlushAllRequest& request, FlushAllResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    フラッシュ対象のコレクションが含まれるデータベースを指定します。

- `WithWaitFlushedMs(int64_t wait_flushed_ms)`

    すべてのフラッシュ操作が完了するまでの待機時間を設定します。0 を指定すると無期限に待機します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合や、レスポンスを解析できない場合にこの例外が発生することがあります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::FlushAllRequest()
    .WithDatabaseName("default")
    .WithWaitFlushedMs(60000);
milvus::FlushAllResponse response;
status = client->FlushAll(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
