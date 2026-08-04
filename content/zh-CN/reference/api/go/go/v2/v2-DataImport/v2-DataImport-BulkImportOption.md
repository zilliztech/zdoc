---
title: "BulkImportOption | Go | v2"
slug: /go/go/v2-DataImport-BulkImportOption
sidebar_label: "BulkImportOption"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "BulkImportOption | Go | v2"
type: docx
token: ZG2ndWgIwogyOAxAzH5ciWY3nlb
sidebar_position: 2
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - BulkImportOption
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# BulkImportOption

BulkImportOption

此类型用于配置 RESTful 导入 API 的批量导入请求。对于自托管的 Milvus，请使用 `NewBulkImportOption()` 构造；对于 Zilliz Cloud，请使用 `NewCloudBulkImportOption()` 构造。构造完成后，可链式调用 `With*` 构建器方法来提供可选字段，例如分区名称、API 密钥和额外选项。

```go
type BulkImportOption struct {
    URL            string
    CollectionName string
    Files          [][]string
    PartitionName  string
    APIKey         string
    ObjectURL      string
    ClusterID      string
    AccessKey      string
    SecretKey      string
    Options        map[string]string
}
```

**字段：**

- **URL** (*string*) -<br/>
  Milvus 或 Zilliz Cloud 集群的基础 URL。不要包含路径；该函数会自动追加 `/v2/vectordb/jobs/import/create`。

- **CollectionName** (*string*) -<br/>
  目标集合的名称。必填。

- **Files** (*[][]string*) -<br/>
  要导入的文件路径列表。每个内部切片表示一批将一起导入的文件。与 `NewBulkImportOption()` 一起使用。对于云导入为可选。

- **PartitionName** (*string*) -<br/>
  集合中的目标分区。可选；如果省略，数据将写入默认分区。

- **APIKey** (*string*) -<br/>
  作为 `Bearer` 请求头发送的授权令牌。可选；当服务器启用基于令牌的身份验证时为必填。

- **ObjectURL** (*string*) -<br/>
  用于云导入的 S3 或兼容对象 URL。与 `NewCloudBulkImportOption()` 一起使用。可选。

- **ClusterID** (*string*) -<br/>
  Zilliz Cloud 集群 ID。与 `NewCloudBulkImportOption()` 一起使用。可选。

- **AccessKey** (*string*) -<br/>
  对象存储的访问密钥。可选。

- **SecretKey** (*string*) -<br/>
  对象存储的密钥。可选。

- **Options** (*map[string]string*) -<br/>
  转发到导入 API 的额外键值参数。使用 `WithOption()` 添加条目。

**构建器方法：**

- `WithPartition(partitionName string)`<br/>
  设置导入数据的目标分区。

- `WithAPIKey(key string)`<br/>
  设置作为 `Bearer` 请求头发送的授权令牌。

- `WithOption(key, value string)`<br/>
  向请求负载中添加额外的键值参数。可多次调用以添加更多条目。

**构造函数：**

- `NewBulkImportOption(uri string, collectionName string, files [][]string)`<br/>
  为自托管的 Milvus 集群创建一个 BulkImportOption。`files` 参数是批次列表，其中每个批次都是一个文件路径切片。

- `NewCloudBulkImportOption(uri string, collectionName string, apiKey string, objectURL string, clusterID string, accessKey string, secretKey string)`<br/>
  为 Zilliz Cloud 集群创建一个 BulkImportOption。对于云对象存储，使用 `ObjectURL` 而不是 `Files`。

