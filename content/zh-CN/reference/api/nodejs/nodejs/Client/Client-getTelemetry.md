---
title: "getTelemetry() | Node.js"
slug: /node/node/Client-getTelemetry
sidebar_label: "getTelemetry()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回附加到此客户端的遥测管理器，用于检查和自定义命令处理程序。 | Node.js"
type: docx
token: LMSCdLflPoeX27xgsbocsSsHn2d
sidebar_position: 10
keywords: 
  - 客户端遥测
  - 命令处理程序
  - 遥测管理器
  - zilliz
  - zilliz cloud
  - 云
  - getTelemetry()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getTelemetry()

此操作返回附加到此客户端的遥测管理器，用于检查和自定义命令处理程序。

```typescript
milvusClient.getTelemetry()
```

**返回类型：**

*ClientTelemetryManager*

**返回：**

附加到此客户端的遥测管理器。可使用它检查遥测状态，并注册自定义命令处理程序。

**方法：**

- **start**（*void*） -

    启动遥测心跳循环。

- **setSdkVersion**（*void*） -

    设置随遥测事件上报的 SDK 版本。

- **stop**（*void*） -

    停止遥测心跳循环。

- **isSupported**（*boolean*） -

    报告所连接的服务器是否支持客户端遥测。

- **getConfig**（*Required&lt;TelemetryConfig&gt;*） -

    返回解析后的遥测配置：enabled、heartbeatIntervalMs、samplingRate、errorMaxCount 和 clientId。

- **registerCommandHandler**（*void*） -

    为具名的服务器命令类型注册处理程序。当服务器通过 `processCommands()` 下发匹配的命令时，该处理程序会运行。

- **recordOperation**（*void*） -

    将一次客户端操作（延迟、Collection 以及成功或错误）记录到遥测收集器中。记录会按照配置的采样率进行采样。

- **getRecentErrors**（*TelemetryError[]*） -

    返回最近的遥测错误，按从新到旧排序，最多返回 `maxCount` 条（默认为 100）。

- **getMetricsSnapshots**（*TelemetrySnapshot[]*） -

    返回当前按操作划分的指标快照，这些快照已裁剪至保留窗口内。

- **processCommands**（*Promise&lt;void&gt;*） -

    通过已注册的处理程序处理服务器下发的命令。不能在命令处理程序中递归调用此方法。

**异常：**

- **MilvusError**

    当服务器拒绝请求或 RPC 失败时抛出。请检查服务器错误消息，以获取确切的失败原因。

## 示例\{#example}

```javascript
const telemetry = milvusClient.getTelemetry();
```
