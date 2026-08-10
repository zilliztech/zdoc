---
title: "getServerVersionV2() | Java | v2"
slug: /java/java/v2-Client-getServerVersionV2
sidebar_label: "getServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取服务器版本信息。当您除了版本字符串外，还需要构建时间、Git 提交、Go 版本和部署模式时，请使用 `detail(true)`。 | Java | v2"
type: docx
token: KrSgdfCaJosFp5xwHIAcV0tAnec
sidebar_position: 6
keywords: 
  - 图像搜索
  - LLMs
  - 机器学习
  - RAG
  - zilliz
  - zilliz cloud
  - 云
  - getServerVersionV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getServerVersionV2()

此操作用于获取服务器版本信息。当您除了版本字符串外，还需要构建时间、Git 提交、Go 版本和部署模式时，请使用 `detail(true)`。

```java
public GetServerVersionResp getServerVersionV2(GetServerVersionReq request)
```

## 请求语法\{#request-syntax}

```java
getServerVersionV2(GetServerVersionReq.builder()
    .detail(Boolean detail)
    .build());
```

**构建器方法：**

- `detail(Boolean detail)`

    是否获取详细的服务器构建信息。默认为 `Boolean.FALSE`。

**返回：**

*GetServerVersionResp*

**异常：**

- **MilvusClientException**

    当验证失败或服务器为此操作返回错误时，将引发此异常。

## 示例\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

GetServerVersionResp version = client.getServerVersionV2(GetServerVersionReq.builder()
    .detail(true)
    .build());
System.out.println(version.getVersion());
System.out.println(version.getGitCommit());
```

{/* category: Client; action: CREATE; addedSince: v3.0.x */}
