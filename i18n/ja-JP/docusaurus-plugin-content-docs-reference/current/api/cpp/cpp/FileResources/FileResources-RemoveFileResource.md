---
title: "RemoveFileResource() | Cloud"
slug: /cpp/cpp/FileResources-RemoveFileResource
sidebar_label: "RemoveFileResource()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、登録済みのファイルリソースを削除します。参照されなくなったリソースのクリーンアップに使用します。 | Cloud"
type: docx
token: Gs0EdiKeEoU5Exxxnb8ckz74nId
sidebar_position: 6
keywords: 
  - ベクトルデータベースとは
  - vectordb
  - マルチモーダルベクトルデータベース検索
  - Retrieval Augmented Generation
  - zilliz
  - zilliz cloud
  - cloud
  - RemoveFileResource()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# RemoveFileResource()

この操作は、登録済みのファイルリソースを削除します。参照されなくなったリソースのクリーンアップに使用します。

```c++
Status RemoveFileResource(const RemoveFileResourceRequest& request)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
```

**リクエストメソッド:**

- `WithName(const std::string& name)`

    削除するリソース名を指定します。

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

auto request = milvus::RemoveFileResourceRequest()
    .WithName("embedding_model");
status = client->RemoveFileResource(request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

{/* category: File Resources; action: CREATE; addedSince: v3.0.x */}
