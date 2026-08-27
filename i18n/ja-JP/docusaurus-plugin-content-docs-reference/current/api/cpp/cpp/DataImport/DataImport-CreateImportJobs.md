---
title: "CreateImportJobs() | Cloud"
slug: /cpp/cpp/DataImport-CreateImportJobs
sidebar_label: "CreateImportJobs()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、オブジェクトストレージに保存されたファイルから Milvus コレクションへデータを読み込むためのバルクインポートジョブを作成します。RESTful インポート API を通じて Milvus サーバーと直接通信し、割り当てられたジョブ ID を含む JSON オブジェクトを返します。進捗状況の監視には `GetImportJobProgress()` を使用してください。 | Cloud"
type: docx
token: FdxMdw01eoWnXKx4Q4rcUh0unFf
sidebar_position: 1
keywords: 
  - hybrid ベクトル検索
  - 動画の重複排除
  - 動画類似検索
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - cloud
  - CreateImportJobs()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# CreateImportJobs()

この操作は、オブジェクトストレージに保存されたファイルから Milvus コレクションへデータを読み込むためのバルクインポートジョブを作成します。RESTful インポート API を通じて Milvus サーバーと直接通信し、割り当てられたジョブ ID を含む JSON オブジェクトを返します。進捗状況の監視には `GetImportJobProgress()` を使用してください。

```c++
static nlohmann::json BulkImport::CreateImportJobs(
    const std::string& url,
    const std::string& collection_name,
    const std::vector<std::string>& files,
    const std::string& db_name = "default",
    const std::string& api_key = "",
    const std::string& partition_name = "",
    const nlohmann::json& options = nlohmann::json{})
```

## リクエスト構文\{#request-syntax}

```c++
auto resp = milvus::BulkImport::CreateImportJobs(
    url,
    collection_name,
    files,
    db_name,
    api_key,
    partition_name,
    options);
```

**パラメータ:**

- `url` (*const std::string&*)

    **[必須]**

    Milvus サーバーの URL です（例: `"YOUR_CLUSTER_ENDPOINT"`）。

- `collection_name` (*const std::string&*)

    **[必須]**

    対象コレクションの名前です。

- `files` (*const std::ベクトル&lt;std::string&gt;&*)

    **[必須]**

    オブジェクトストレージのルートからの相対ファイルパスのリストです。各パスには、単一の JSON/Parquet ファイルまたはフォルダーを指定できます。例: `{"parquet-folder/1.parquet", "parquet-folder/2.parquet"}`。

- `db_name` (*const std::string&*)

    コレクションを含むデータベースの名前です。デフォルトは `"default"` です。

- `api_key` (*const std::string&*)

    認証用の API キーです。Milvus の場合は `"username:password"` を、Zilliz Cloud の場合はクラウド API キーを渡します。

- `partition_name` (*const std::string&*)

    対象パーティションの名前です。省略可能で、コレクションがパーティションキーを使用していない場合にのみ指定します。

- `options` (*const nlohmann::json&*)

    JSON 形式の追加インポートオプションです。`"timeout"`（整数、秒単位）をサポートします。

**戻り値:**

*nlohmann::json*

成功時はジョブ ID を含む JSON オブジェクト、失敗時は `nullptr` を返します。レスポンスの `jobId` フィールドは `GetImportJobProgress()` に渡すことができます。

**例外:**

- **std::exception**

    HTTP リクエストの失敗時やレスポンスの解析不能時にスローされます。失敗を検出するには、戻り値に `nullptr` が含まれていないか確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create an import job using local Milvus
auto resp = milvus::BulkImport::CreateImportJobs(
    "YOUR_CLUSTER_ENDPOINT",               // Milvus server URL
    "my_collection",                         // Target collection
    {"parquet-folder/1.parquet",            // Files to import
     "parquet-folder/2.parquet"},
    "default",                              // Database name
    "YOUR_CLUSTER_TOKEN",                          // API key (user:password)
    ""                                      // Partition name (optional)
);

if (!resp.is_null()) {
    std::string job_id = resp["data"]["jobId"];
    std::cout << "Import job created: " << job_id << std::endl;
} else {
    std::cout << "Failed to create import job" << std::endl;
}
```
