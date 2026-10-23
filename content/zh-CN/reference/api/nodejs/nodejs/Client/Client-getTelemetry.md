---
title: "getTelemetry() | Node.js"
slug: /node/node/Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回附加到当前客户端的遥测管理器，供检查和自定义命令处理器使用。 | Node.js"
type: docx
token: LMSCdLflPoeX27xgsbocsSsHn2d
sidebar_position: 10
keywords: 
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - 稠密嵌入
  - zilliz
  - zilliz cloud
  - 云
  - getTelemetry()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getTelemetry()

此操作返回附加到此客户端的遥测管理器，可供检查和自定义命令处理器使用。

```typescript
milvusClient.getTelemetry()
```

**返回类型：**

*ClientTelemetryManager*

**返回：**

附加到此客户端的遥测管理器。可使用它检查遥测状态，并注册自定义命令处理器。

**方法：**

- **start** (*void*) -

    启动遥测心跳循环。

- **setSdkVersion** (*void*) -

    设置随遥测事件报告的 SDK 版本。

- **stop** (*void*) -

    停止遥测心跳循环。

- **isSupported** (*boolean*) -

    报告连接的服务器是否支持客户端遥测。

- **getConfig** (*Required&lt;TelemetryConfig&gt;*) -

    返回解析后的遥测配置：enabled、heartbeatIntervalMs、samplingRate、errorMaxCount 和 clientId。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息以获取确切的失败原因。

## 示例\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
