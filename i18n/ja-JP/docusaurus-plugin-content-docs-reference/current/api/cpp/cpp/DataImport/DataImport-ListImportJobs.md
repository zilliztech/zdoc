---
title: "ListImportJobs() | Cloud"
slug: /cpp/cpp/DataImport-ListImportJobs
sidebar_label: "ListImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定したコレクションに関連するすべてのバルクインポートジョブの一覧を取得します。過去および進行中のインポート操作の監査に役立ちます。 | Cloud"
type: docx
token: Ls7kdwtuJoZfVUx1N3vc5tkznuh
sidebar_position: 3
keywords: 
  - オープンソースベクトルデータベース
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルDB
  - zilliz
  - zilliz cloud
  - cloud
  - ListImportJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# ListImportJobs()

この操作は、指定したコレクションに関連するすべてのバルクインポートジョブの一覧を取得します。過去および進行中のインポート操作の監査に役立ちます。

```c++
static nlohmann::json BulkImport::ListImportJobs(
    const std::string& url,
    const std::string& collection_name,
    const std::string& db_name = "default",
    const std::string& api_key = "")
```

## リクエスト構文\{#request-syntax}

```c++
auto resp = milvus::BulkImport::ListImportJobs(
    url,
    collection_name,
    db_name,
    api_key);
```

**パラメータ:**

- `url` (*const std::string&*)

    **[必須]**

    Milvus サーバーの URL（例: `"YOUR_CLUSTER_ENDPOINT"`）。

- `collection_name` (*const std::string&*)

    **[必須]**

    インポートジョブの一覧を取得するコレクションの名前。

- `db_name` (*const std::string&*)

    コレクションを含むデータベースの名前。デフォルトは `"default"` です。

- `api_key` (*const std::string&*)

    認証用の API キー。`"username:password"` の場合は Milvus として、Zilliz Cloud の場合はクラウド API キーとして渡します。

**戻り値:**

*nlohmann::json*

インポートジョブのレコード配列を含む JSON オブジェクトを返します。失敗時は `nullptr` が返されます。各レコードにはジョブ ID、状態、作成時刻が含まれます。

**例外:**

- **std::exception**

    HTTP リクエストの失敗時やレスポンスの解析不能時にスローされます。失敗を検出するには、戻り値が `nullptr` かどうかを確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// List all import jobs for a collection
auto resp = milvus::BulkImport::ListImportJobs(
    "YOUR_CLUSTER_ENDPOINT",
    "my_collection",
    "default",
    "YOUR_CLUSTER_TOKEN"
);

if (!resp.is_null()) {
    for (auto& job : resp["data"]["records"]) {
        std::cout << "Job ID: " << job["jobId"]
                  << "  State: " << job["state"] << std::endl;
    }
} else {
    std::cout << "Failed to list import jobs" << std::endl;
}
```
