---
title: "GetImportJobProgress() | Cloud"
slug: /cpp/cpp/DataImport-GetImportJobProgress
sidebar_label: "GetImportJobProgress()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、ジョブIDを指定してバルクインポートジョブの現在の進捗状況とステータスを取得します。`CreateImportJobs()` を呼び出した後、このメソッドをポーリングしてインポートの完了を確認します。 | Cloud"
type: docx
token: NmxkduivloqgeXxVxOpcHydEnne
sidebar_position: 2
keywords: 
  - what is ベクトル db
  - what are ベクトル データベース
  - ベクトル データベース comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - GetImportJobProgress()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetImportJobProgress()

この操作は、ジョブIDを指定してバルクインポートジョブの現在の進捗状況とステータスを取得します。`CreateImportJobs()` を呼び出した後、このメソッドをポーリングしてインポートの完了を確認します。

```c++
static nlohmann::json BulkImport::GetImportJobProgress(
    const std::string& url,
    const std::string& job_id,
    const std::string& db_name = "default",
    const std::string& api_key = "")
```

## リクエスト構文\{#request-syntax}

```c++
auto resp = milvus::BulkImport::GetImportJobProgress(
    url,
    job_id,
    db_name,
    api_key);
```

**パラメータ:**

- `url` (*const std::string&*)

    **[必須]**

    Milvus サーバーのURL（例: `"YOUR_CLUSTER_ENDPOINT"`）。

- `job_id` (*const std::string&*)

    **[必須]**

    照会対象のインポートジョブのID。`CreateImportJobs()` のレスポンスから取得します。

- `db_name` (*const std::string&*)

    ジョブ作成時に使用したデータベース名。デフォルトは `"default"` です。

- `api_key` (*const std::string&*)

    認証用のAPIキー。Milvus の場合は `"username:password"` として、Zilliz Cloud の場合はクラウドAPIキーとして渡します。

**戻り値:**

*nlohmann::json*

ジョブの進捗状況を示すJSONオブジェクト、または失敗時は `nullptr` を返します。`state`（`"Pending"`、`"InProgress"`、`"Completed"`、`"Failed"`）、`progress`（0〜100）、`importedRows` などのフィールドが含まれます。

**例外:**

- **std::exception**

    HTTPリクエストの失敗時やレスポンスの解析不能時にスローされます。エラーを検出するには、戻り値の `nullptr` を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();
milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "root", "Milvus"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

// Create a job first
auto create_resp = milvus::BulkImport::CreateImportJobs(
    "YOUR_CLUSTER_ENDPOINT",
    "my_collection",
    {"parquet-folder/1.parquet"},
    "default",
    "YOUR_CLUSTER_TOKEN"
);

std::string job_id = create_resp["data"]["jobId"];

// Poll for progress
while (true) {
    auto progress_resp = milvus::BulkImport::GetImportJobProgress(
        "YOUR_CLUSTER_ENDPOINT",
        job_id,
        "default",
        "YOUR_CLUSTER_TOKEN"
    );

    if (progress_resp.is_null()) {
        std::cout << "Failed to get progress" << std::endl;
        break;
    }

    std::string state = progress_resp["data"]["state"];
    int progress = progress_resp["data"]["progress"];
    std::cout << "State: " << state << "  Progress: " << progress << "%" << std::endl;

    if (state == "Completed" || state == "Failed") break;
    std::this_thread::sleep_for(std::chrono::seconds(2));
}
```
