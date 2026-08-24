---
title: "ListRefreshExternalCollectionJobs() | Cloud"
slug: /cpp/cpp/Management-ListRefreshExternalCollectionJobs
sidebar_label: "ListRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、外部コレクションのリフレッシュジョブを一覧表示します。過去または実行中の外部コレクションリフレッシュ状況を確認する際に使用します。 | Cloud"
type: docx
token: TjrfdFKTIoiaQ0x3NXUcMEvHnNb
sidebar_position: 4
keywords: 
  - milvus db
  - milvus ベクトル db
  - Zilliz Cloud
  - what is milvus
  - zilliz
  - zilliz cloud
  - cloud
  - ListRefreshExternalCollectionJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListRefreshExternalCollectionJobs()

この操作は、外部コレクションのリフレッシュジョブを一覧表示します。過去または実行中の外部コレクションリフレッシュ状況を確認する際に使用します。

```c++
Status ListRefreshExternalCollectionJobs(const ListRefreshExternalCollectionJobsRequest& request, ListRefreshExternalCollectionJobsResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::ListRefreshExternalCollectionJobsRequest();
```

**戻り値:**

*Status*

**例外:**

- **std::exception**

    この例外は、リクエストの送信に失敗した場合やレスポンスを解析できない場合にスローされる可能性があります。

## 例\{#example}

```c++
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::ListRefreshExternalCollectionJobsRequest();
milvus::ListRefreshExternalCollectionJobsResponse response;
status = client->ListRefreshExternalCollectionJobs(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
