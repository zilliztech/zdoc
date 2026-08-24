---
title: "GetRefreshExternalCollectionProgress() | Cloud"
slug: /cpp/cpp/Management-GetRefreshExternalCollectionProgress
sidebar_label: "GetRefreshExternalCollectionProgress()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、refresh-external-コレクション ジョブの進行状況を取得します。ジョブの完了をポーリングし、失敗の理由を確認するために使用します。 | Cloud"
type: docx
token: X9AodAxugobD0Yxt7S9c27z9nNg
sidebar_position: 2
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus データベース
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - GetRefreshExternalCollectionProgress()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetRefreshExternalCollectionProgress()

この操作は、refresh-external-コレクション ジョブの進行状況を取得します。ジョブの完了をポーリングし、失敗の理由を確認するために使用します。

```c++
Status GetRefreshExternalCollectionProgress(const GetRefreshExternalCollectionProgressRequest& request, GetRefreshExternalCollectionProgressResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::GetRefreshExternalCollectionProgressRequest()
    .WithJobID(job_id);
```

**リクエスト メソッド:**

- `WithJobID(int64_t job_id)`

    `RefreshExternalCollection()` が返すリフレッシュ ジョブ ID を設定します。

**戻り値:**

*Status*

**例外:**

- **std::exception**

    リクエストの送信に失敗した場合や、レスポンスを解析できない場合に、この例外がスローされることがあります。

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
