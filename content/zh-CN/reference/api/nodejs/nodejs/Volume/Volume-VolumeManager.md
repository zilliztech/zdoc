---
title: "VolumeManager | Node.js"
slug: /node/node/Volume-VolumeManager
sidebar_label: "VolumeManager"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此类通过云控制平面管理 Zilliz Cloud 项目的存储卷。 | Node.js"
type: origin
token: shared-Volume-VolumeManager
sidebar_position: 1
keywords: 
  - 存储卷
  - 托管存储卷
  - 外部存储卷
  - 存储集成
  - Zilliz
  - Zilliz Cloud
  - 云
  - VolumeManager
  - nodejs30
displayed_sidebar: nodeSidebar

---

# VolumeManager

**VolumeManager** 通过 Zilliz Cloud 控制平面管理 Zilliz Cloud 项目的存储卷。存储卷为外部 Collection 提供存储：**EXTERNAL** 存储卷为只读，在您创建或刷新外部 Collection 时可将其引用为 `volume://` 源；而 **MANAGED** 存储卷是可写入数据的托管存储。

此管理器使用 API key 与 Zilliz Cloud REST 控制平面通信。它仅限云端使用；开源 Milvus 服务器没有存储卷概念。

```javascript
const { VolumeManager } = require('@zilliz/milvus2-sdk-node');

const volumeManager = new VolumeManager({
  cloudEndpoint: 'https://api.zilliz.com',
  apiKey: '_YOUR_API_KEY_',
});
```

## 构造函数\{#constructor}

```javascript
new VolumeManager(config: VolumeManagerConfig)
```

根据 **VolumeManagerConfig** 对象构造 **VolumeManager** 实例。

**参数：**

- **config** （*VolumeManagerConfig*） -

    **[必需]**

    此管理器的配置。

    - **cloudEndpoint** （*string*） -

        **[必需]**

        Zilliz Cloud 控制平面 Endpoint。

    - **apiKey** （*string*） -

        **[必需]**

        Zilliz Cloud API key。请求将其作为 Bearer token 携带。

    - **fetch** （*typeof fetch*） -

        自定义的 `fetch` 实现。默认使用全局 `fetch`。

    - **timeout** （*number*） -

        请求超时时间，单位为毫秒。默认使用 SDK 默认的 HTTP 超时时间。

## 方法\{#methods}

**方法：**

- **createVolume** （*Promise&lt;VolumeResponse&gt;*） -

    在项目和区域中创建存储卷。

    - **data** （*VolumeCreateReq*） -

        **[必需]**

        - **projectId** （*string*） -

            **[必需]**

            Zilliz Cloud 项目的 ID。

        - **regionId** （*string*） -

            **[必需]**

            存储卷所属区域的 ID。

        - **volumeName** （*string*） -

            **[必需]**

            要创建的存储卷的名称。

        - **type** （*string*） -

            存储卷类型：**MANAGED**（默认）或 **EXTERNAL**。**EXTERNAL** 存储卷需要 **storageIntegrationId** 和 **path**，并且为只读。

        - **storageIntegrationId** （*string*） -

            为 **EXTERNAL** 存储卷提供底层支持的存储集成。当 **type** 为 **EXTERNAL** 时必需。

        - **path** （*string*） -

            **EXTERNAL** 存储卷的存储路径。当 **type** 为 **EXTERNAL** 时必需。

- **listVolumes** （*Promise&lt;VolumeResponse&gt;*） -

    列出项目的存储卷。

    - **data** （*VolumeListReq*） -

        **[必需]**

        - **projectId** （*string*） -

            **[必需]**

            Zilliz Cloud 项目的 ID。

        - **currentPage** （*number*） -

            要返回的页码。该值默认为 1。

        - **pageSize** （*number*） -

            每页的存储卷数量（1 到 100）。该值默认为 10。

        - **type** （*string*） -

            按存储卷类型筛选结果：**MANAGED** 或 **EXTERNAL**。

- **describeVolume** （*Promise&lt;VolumeResponse&gt;*） -

    按名称描述一个存储卷。

    - **data** （*VolumeNameReq*） -

        **[必需]**

        - **volumeName** （*string*） -

            **[必需]**

            要描述的存储卷的名称。

- **applyVolume** （*Promise&lt;VolumeResponse&gt;*） -

    将存储卷应用到路径：对于 **MANAGED** 存储卷，将存储卷数据暂存到指定路径。**EXTERNAL** 存储卷为只读，无法应用。

    - **data** （*VolumeApplyReq*） -

        **[必需]**

        - **volumeName** （*string*） -

            **[必需]**

            要应用的存储卷的名称。

        - **path** （*string*） -

            **[必需]**

            要将存储卷应用到的路径。

- **deleteVolume** （*Promise&lt;VolumeResponse&gt;*） -

    按名称删除一个存储卷。

    - **data** （*VolumeNameReq*） -

        **[必需]**

        - **volumeName** （*string*） -

            **[必需]**

            要删除的存储卷的名称。

**返回：**

*Promise&lt;VolumeResponse&gt;*

每个方法都会解析为 **VolumeResponse**，其中包含控制平面响应（`code`、`data` 和 `message`）。

所有方法都接受末尾一个可选的 **VolumeRequestOptions** 参数，其中包含 **timeout**（单位为毫秒）和用于取消的 **abortController**。

**异常：**

- **Error**

    当控制平面拒绝请求时引发。请检查响应中的 `code` 和 `message`，以了解确切的失败原因。

## 示例\{#example}

```javascript
const created = await volumeManager.createVolume({
  projectId: 'proj-xxxxxxxx',
  regionId: 'aws-us-west-2',
  volumeName: 'my-external-volume',
  type: 'EXTERNAL',
  storageIntegrationId: 'int-xxxxxxxx',
  path: 's3://my-bucket/volumes/main',
});

const volumes = await volumeManager.listVolumes({ projectId: 'proj-xxxxxxxx' });
```
