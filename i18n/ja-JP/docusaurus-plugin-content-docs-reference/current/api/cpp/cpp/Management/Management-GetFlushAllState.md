---
title: "GetFlushAllState() | Cloud"
slug: /cpp/cpp/Management-GetFlushAllState
sidebar_label: "GetFlushAllState()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、flush-all 操作が完了したかどうかを確認します。最初の flush リクエストとは別に完了状態をポーリングする場合に使用します。 | Cloud"
type: docx
token: TBtpd6bsLoelhbx2iXDccaVDnqe
sidebar_position: 22
keywords: 
  - オーディオ類似検索
  - エラスティックベクトルデータベース
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetFlushAllState()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetFlushAllState()

この操作は、flush-all 操作が完了したかどうかを確認します。最初の flush リクエストとは別に完了状態をポーリングする場合に使用します。

```c++
Status GetFlushAllState(const GetFlushAllStateRequest& request, GetFlushAllStateResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
```

**リクエストメソッド:**

- `WithDatabaseName(const std::string& db_name)`

    元の flush-all 操作で使用するデータベースを指定します。

- `WithFlushAllTs(uint64_t flush_all_ts)`

    `FlushAll()` が返すタイムスタンプを設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合や、レスポンスを解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetFlushAllStateRequest()
    .WithDatabaseName("default")
    .WithFlushAllTs(flush_all_ts);
milvus::GetFlushAllStateResponse response;
status = client->GetFlushAllState(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: Management; action: CREATE; addedSince: v3.0.x */}
