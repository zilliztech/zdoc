---
title: "getImportProgress() | Java | v2"
slug: /java/java/v2-BulkImport-getImportProgress
sidebar_label: "getImportProgress()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作获取指定批量导入任务的进度。 | Java | v2"
type: docx
token: EjnFdC5EfoIkoExSBOxcEC2hnbg
sidebar_position: 3
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - getImportProgress()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getImportProgress()

此操作获取指定批量导入任务的进度。

```java
public static String getImportProgress(String url, BaseDescribeImportRequest request)
```

## 请求语法\{#request-syntax}

```java
bulkImport.getImportProgress(
    url,
    request
)
```

**参数：**

- **url** (*String*) -

    Zilliz Cloud 的控制平面 API 端点。端点 URL 应采用以下格式：

    ```python
    https://api.cloud.zilliz.com
    ```

- **request** (*[BaseDescribeImportRequest](./v2-BulkImport-getImportProgress#basedescribeimportrequest)*) -  

    一个 **BaseImportRequest** 实例。

**返回类型：**

*String*

**返回：**

指定导入任务的导入进度。

## BaseDescribeImportRequest\{#basedescribeimportrequest}

**BaseDescribeImportRequest** 实例由 **CloudDescribeImportRequest** 实现。

### CloudDescribeImportRequest\{#clouddescribeimportrequest}

```java
CloudDescribeImportRequest.builder()
    .apiKey(String apiKey)
    .jobId(String jobId)
    .build()
```

**构建器方法：**

- `apiKey(String apiKey)`

    具有足够权限来操作集群的有效 Zilliz Cloud API 密钥。

- `jobId(String jobId)`

    现有导入任务的 ID。

## 示例\{#example}

```java

```

