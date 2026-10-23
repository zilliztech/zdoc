---
title: "GetServerVersionV2() | Cloud"
slug: /cpp/cpp/Client-GetServerVersionV2
sidebar_label: "GetServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Milvus サーバーのバージョンを返します。リクエストで `WithDetail(true)` を設定すると、レスポンスにはサーバーのビルド時間、Git コミット、Go バージョン、デプロイモードも含まれます。 | Cloud"
type: docx
token: EVSGdMtnqoaLzixGFkfcrdCHnNe
sidebar_position: 9
keywords: 
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - RAG ベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - GetServerVersionV2()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetServerVersionV2()

この操作は、Milvus サーバーのバージョンを返します。リクエストで `WithDetail(true)` を設定すると、レスポンスにはサーバーのビルド時間、Git コミット、Go バージョン、デプロイモードも含まれます。

```c++
Status GetServerVersionV2(const GetServerVersionRequest& request, GetServerVersionResponse& response)
```

## リクエスト構文\{#request-syntax}

```c++
auto request = GetServerVersionRequest()
    .WithDetail(detail);
```

**リクエストメソッド:**

- `WithDetail(bool detail)`

    `true` に設定すると、レスポンスにはサーバーのビルド時間、Git コミット、Go バージョン、およびデプロイモードも含まれます。

**戻り値:**

*Status* と *GetServerVersionResponse*

成功したかどうかは `status.IsOk()` で確認します。

### GetServerVersionResponse\{#getserverversionresponse}

**メソッド:**

- `const std::string& Version() const`

    サーバーのバージョンを返します。

- `const std::string& BuildTime() const`

    サーバーのビルド時間を返します。リクエストで `WithDetail(true)` を設定すると、この値が格納されます。

- `const std::string& GitCommit() const`

    サーバーの Git コミットを返します。リクエストで `WithDetail(true)` を設定すると、この値が格納されます。

- `const std::string& GoVersion() const`

    サーバーのビルドに使用された Go バージョンを返します。リクエストで `WithDetail(true)` を設定すると、この値が格納されます。

- `const std::string& DeployMode() const`

    サーバーのデプロイモードを返します。リクエストで `WithDetail(true)` を設定すると、この値が格納されます。

**例外:**

- **StatusCode**

    エラーの詳細は、`status.Code()` と `status.Message()` で確認します。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::GetServerVersionRequest request;
request.WithDetail(true);
milvus::GetServerVersionResponse response;
status = client->GetServerVersionV2(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
std::cout << "The milvus server version is: " << response.Version() << std::endl;
```
