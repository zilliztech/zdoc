---
title: "GetTelemetry() | Cloud"
slug: /cpp/cpp/Client-GetTelemetry
sidebar_label: "GetTelemetry()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the telemetry manager for diagnostics and custom command handlers. | Cloud"
type: docx
token: UxoUdxGonoInL0xixsdcRHNwnll
sidebar_position: 14
keywords: 
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
  - zilliz
  - zilliz cloud
  - cloud
  - GetTelemetry()
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# GetTelemetry()

This operation returns the telemetry manager for diagnostics and custom command handlers.

```c++
ClientTelemetryManagerPtr GetTelemetry() const
```

**RETURNS:**

*ClientTelemetryManagerPtr*

Returns a `std::shared_ptr<ClientTelemetryManager>` for the connected client, or `nullptr` when telemetry is not available.

### ClientTelemetryManager\{#clienttelemetrymanager}

The telemetry manager reports client metrics and heartbeats and handles server-pushed commands.

**METHODS:**

- `void RegisterCommandHandler(const std::string& command_type, CommandHandler handler)`

    Registers a handler for a custom server-pushed command type. The handler is invoked with a `TelemetryCommand` and returns a `TelemetryCommandReply`.

- `void RecordOperation(const std::string& operation, const std::string& collection, std::chrono::steady_clock::time_point started, bool success, const std::string& error_message, const std::string& request_id = "")`

    Records one operation for the current metrics window.

- `const std::string& LastCommandTimestamp() const`

    Returns the timestamp of the last processed command.

**ERROR HANDLING:**

- **std::exception**

    Thrown when request construction, transport, or response processing fails. Inspect the exception message or returned Status for failure details.

## Example\{#example}

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
