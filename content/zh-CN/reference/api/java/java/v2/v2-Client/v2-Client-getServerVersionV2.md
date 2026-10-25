---
title: "getServerVersionV2() | Java | v2"
slug: /java/java/v2-Client-getServerVersionV2
sidebar_label: "getServerVersionV2()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取服务器版本信息。除版本字符串外，如果您还需要构建时间、Git 提交、Go 版本和部署模式，请使用 `detail(true)`。 | Java | v2"
type: docx
token: KrSgdfCaJosFp5xwHIAcV0tAnec
sidebar_position: 6
keywords: 
  - 图像搜索
  - 大语言模型
  - 机器学习
  - RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - getServerVersionV2()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getServerVersionV2()

此操作获取服务器版本信息。除版本字符串外，如果您还需要构建时间、Git 提交、Go 版本和部署模式，请使用 `detail(true)`。

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

    是否获取详细的服务器构建信息。该值默认为 `Boolean.FALSE`。

**返回类型：**

*GetServerVersionResp*

**返回：**

一个包含服务器版本信息的 **GetServerVersionResp** 对象。响应包含以下字段：

**参数：**

- **version** （*String*） -

    所连接服务器的版本字符串。

- **buildTime** （*String*） -

    服务器的构建时间。设置 `detail(true)` 时返回。

- **gitCommit** （*String*） -

    构建服务器时所使用的 Git 提交。设置 `detail(true)` 时返回。

- **goVersion** （*String*） -

    构建服务器时所使用的 Go 版本。设置 `detail(true)` 时返回。

- **deployMode** （*String*） -

    服务器的部署模式。设置 `detail(true)` 时返回。

**异常：**

- **MilvusClientException**

    当验证失败或服务器针对此操作返回错误时，将引发此异常。

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
