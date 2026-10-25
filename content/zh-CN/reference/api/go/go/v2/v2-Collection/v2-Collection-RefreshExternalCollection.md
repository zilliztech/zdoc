---
title: "RefreshExternalCollection() | Go | v2"
slug: /go/go/v2-Collection-RefreshExternalCollection
sidebar_label: "RefreshExternalCollection()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，以记录这些元数据文件与这些数据文件之间的映射关系。 | Go | v2"
type: docx
token: Mw42dp2VZoN4gFxdiSYcxDB8n0g
sidebar_position: 33
keywords: 
  - 向量相似性搜索
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - Zilliz
  - Zilliz Cloud
  - 云
  - RefreshExternalCollection()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# RefreshExternalCollection()

此操作会扫描 Schema 定义的外部存储中的数据文件，并生成元数据文件，以记录这些元数据文件与这些数据文件之间的映射关系。

```go
func (c *Client) RefreshExternalCollection(ctx context.Context, option RefreshExternalCollectionOption, callOptions ...grpc.CallOption) (*RefreshExternalCollectionResult, error)
```

## 请求语法\{#request-syntax}

为 RefreshExternalCollection() 创建请求。

```go
option := client.NewRefreshExternalCollectionOption(collectionName).
    WithExternalSource(externalSource string).
    WithExternalSpec(externalSpec string).
    WithDbName(dbName string)
    
result, err := client.RefreshExternalCollection(option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    现有外部 Collection 的名称。

**构建器方法：**

- `WithExternalSource(externalSource string)`

    此方法设置源数据 URI，其格式类似于 AWS S3 对象路径。

- `WithExternalSpec(externalSpec string)`

    外部源规范，即一组辅助参数：

    - **format** （*string*） -

        目标源数据文件的格式。可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **extfs** （*string*） -

        以字符串化 JSON 结构表示的外部文件系统设置。可选选项如下：

        - **access_key_id** （*string*） -

            您对象存储服务的访问密钥 ID。

        - **access_key_val** （*string*） -

            您对象存储服务的访问密钥值。

        - **cloud_provider** （*string*） -

            您对象存储服务的云服务提供商。

        - **region** （*string*） -

            您对象存储服务的区域。

        - **use_iam** （*string*） -

            是否使用 AWS IAM 进行存储桶访问身份验证。可选值为 `"true"` 或 `"false"`。

        - **iam_endpoint** （*string*） -

            AWS IAM STS Endpoint。

        - **use_ssl** （*string*） -

            是否使用 SSL 访问您的对象存储桶。可选值为 `"true"` 或 `"false"`。

        - **use_virtual_host** （*string*） -

            是否使用虚拟主机方式进行存储桶访问。有关详细信息，请参见 [本文](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)。

        - **storage_type** （*string*） -

            存储类型。可选值为 `remote`。

        - **role_arn** （*string*） -

            从存储桶所有者处获取的 AWS IAM Role ARN。

        - **external_id** （*string*） -

            从存储桶所有者处获取的外部 ID。

        - **load_frequency** （*string*） -

            Milvus 检索临时身份验证凭据的间隔，单位为秒。

- `WithDbName(dbName string)`

    目标外部 Collection 所属的 Database 名称。

**返回类型：**

&ast;*RefreshExternalCollectionResult*

**返回：**

返回以下结构的类型结构体。

```go
type RefreshExternalCollectionResult struct {
    JobID int64
}
```

**参数：**

- **JobID** （*int64*） -

    表示已创建的异步作业的整数。

**异常：**

- **error**

    验证、请求构建或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 RefreshExternalCollection() 的用法。

```go
refreshResult, err := client.RefreshExternalCollection(ctx,
    client.NewRefreshExternalCollectionOption("test_collection"))

jobID := refreshResult.JobID

for {
    progress, _ := client.GetRefreshExternalCollectionProgress(ctx,
        client.NewGetRefreshExternalCollectionProgressOption(jobID))

    fmt.Printf("State: %s\n", progress.State)

    if progress.State == entity.RefreshStateCompleted {
        fmt.Println("Refresh completed!")
        break
    }
    if progress.State == entity.RefreshStateFailed {
        fmt.Printf("Refresh failed: %s\n", progress.Reason)
        break
    }
    time.Sleep(2 * time.Second)
}
```
