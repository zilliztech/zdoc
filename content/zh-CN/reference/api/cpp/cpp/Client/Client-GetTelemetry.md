---
title: "GetTelemetry() | Cloud"
slug: /cpp/cpp/Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回遥测管理器，用于诊断和自定义命令处理程序。 | Cloud"
type: docx
token: UxoUdxGonoInL0xixsdcRHNwnll
sidebar_position: 14
keywords: 
  - Zilliz Cloud
  - 什么是 Milvus
  - Milvus Database
  - Milvus Lite
  - zilliz
  - zilliz cloud
  - 云
  - GetTelemetry()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetTelemetry()

此操作返回遥测管理器，用于诊断和自定义命令处理程序。

```c++
ClientTelemetryManagerPtr GetTelemetry() const
```

**返回值：**

*ClientTelemetryManagerPtr*

返回已连接客户端的 `std::shared_ptr<ClientTelemetryManager>`；当遥测不可用时返回 `nullptr`。

### ClientTelemetryManager\{#clienttelemetrymanager}

遥测管理器会报告客户端指标和心跳，并处理服务器推送的命令。

**方法：**

- `void RegisterCommandHandler(const std::string& command_type, CommandHandler handler)`

    为自定义的服务器推送命令类型注册处理程序。处理程序会接收一个 `TelemetryCommand`，并返回一个 `TelemetryCommandReply`。

- `void RecordOperation(const std::string& operation, const std::string& collection, std::chrono::steady_clock::time_point started, bool success, const std::string& error_message, const std::string& request_id = "")`

    在当前指标窗口内记录一个操作。

- `const std::string& LastCommandTimestamp() const`

    返回最后处理的命令的时间戳。

**错误处理：**

- **std::exception**

    当请求构造、传输或响应处理失败时抛出。请检查异常消息或返回的 Status 以获取失败详情。

## 示例\{#example}

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
