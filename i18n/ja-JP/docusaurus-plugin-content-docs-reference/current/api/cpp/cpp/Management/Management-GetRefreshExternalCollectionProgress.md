---
title: "GetRefreshExternalCollectionProgress() | Cloud"
slug: /cpp/cpp/Management-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションのリフレッシュジョブの進捗状況を取得します。ジョブの完了をポーリングし、失敗理由を確認するために使用します。 | Cloud"
type: docx
token: X9AodAxugobD0Yxt7S9c27z9nNg
sidebar_position: 23
keywords: 
  - Zilliz Cloud
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - GetRefreshExternalCollectionProgress()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

この操作は、外部コレクションのリフレッシュジョブの進捗状況を取得します。ジョブの完了をポーリングし、失敗理由を確認するために使用します。

```c++
Status GetRefreshExternalCollectionProgress(const GetRefreshExternalCollectionProgressRequest& request, GetRefreshExternalCollectionProgressResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
```

**リクエストメソッド：**

- `WithJobID(int64_t job_id)`

    `RefreshExternalCollection()` によって返されるリフレッシュジョブ ID を設定します。

**戻り値：**

*Status*

**例外：**

- **std::exception**

    リクエストを送信できない場合、またはレスポンスを解析できない場合に、この例外が発生する可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
milvus::GetRefreshExternalCollectionProgressResponse response;
status = client->GetRefreshExternalCollectionProgress(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
