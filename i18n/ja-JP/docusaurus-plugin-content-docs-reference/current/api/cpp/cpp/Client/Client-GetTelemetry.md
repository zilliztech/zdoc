---
title: "GetTelemetry() | Cloud"
slug: /cpp/cpp/Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、診断およびカスタムコマンドハンドラー用のテレメトリマネージャーを返します。 | Cloud"
type: docx
token: UxoUdxGonoInL0xixsdcRHNwnll
sidebar_position: 14
keywords: 
  - Zilliz Cloud
  - Milvus とは
  - Milvus データベース
  - Milvus Lite
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - GetTelemetry()
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# GetTelemetry()

この操作は、診断およびカスタムコマンドハンドラー用のテレメトリマネージャーを返します。

```c++
ClientTelemetryManagerPtr GetTelemetry() const
```

**戻り値:**

*ClientTelemetryManagerPtr*

接続されたクライアントの `std::shared_ptr<ClientTelemetryManager>` を返します。テレメトリが利用できない場合は `nullptr` を返します。

### ClientTelemetryManager\{#clienttelemetrymanager}

テレメトリマネージャーは、クライアントのメトリクスとハートビートを報告し、サーバーからプッシュされたコマンドを処理します。

**メソッド:**

- `void RegisterCommandHandler(const std::string& command_type, CommandHandler handler)`

    サーバーからプッシュされるカスタムコマンドタイプのハンドラーを登録します。ハンドラーは `TelemetryCommand` を指定して呼び出され、`TelemetryCommandReply` を返します。

- `void RecordOperation(const std::string& operation, const std::string& collection, std::chrono::steady_clock::time_point started, bool success, const std::string& error_message, const std::string& request_id = "")`

    現在のメトリクスウィンドウに 1 つの操作を記録します。

- `const std::string& LastCommandTimestamp() const`

    最後に処理されたコマンドのタイムスタンプを返します。

**エラー処理:**

- **std::exception**

    リクエストの構築、転送、または応答の処理に失敗した場合にスローされます。失敗の詳細については、例外メッセージまたは返された Status を確認してください。

## 例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto telemetry = client->GetTelemetry();
if (telemetry) {
    telemetry->RegisterCommandHandler(
        "ping",
        [](const milvus::TelemetryCommand&) {
            return milvus::TelemetryCommandReply{};
        });
}
```
