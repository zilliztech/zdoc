---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Schema 实例定义 Milvus v3 Collection Schema，校验结构体数组字段，并支持外部 Collection 源配置。当父级未携带 `maxcapacity` 时，结构体数组解码会保留可空状态，并从子字段中恢复该值。`ExternalSource` 和 `ExternalSpec` 描述外部 Collection 存储和配置。 | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - nlp 搜索
  - zilliz
  - Zilliz Cloud
  - 云
  - Schema
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Schema

Schema 实例定义 Milvus v3 Collection Schema，校验结构体数组字段，并支持外部 Collection 源配置。当父级未携带 `max_capacity` 时，结构体数组解码会保留可空状态，并从子字段中恢复该值。`ExternalSource` 和 `ExternalSpec` 描述外部 Collection 存储和配置。

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
    ExternalSource string
    ExternalSpec string
}
```

**字段：**

- **schema** （*Schema*） -

    表示 Collection 的 Schema。此 Schema 包括字段定义、函数和动态字段设置。- **CollectionName** （*string*） - 存储 Collection 名称。- **Description** （*string*） - 存储 Collection 描述。- **AutoID** （*bool*） - 指示 Milvus 是否自动生成主键。- **Fields** （<em>[]</em>Field*） - 包含 Collection 字段定义。- EnableDynamicField （*bool*） - 指示是否启用动态字段。- Functions （*[]*Function*） - 包含内置函数定义。- **ExternalSource** （*string*） - 外部数据源（例如 "s3://bucket/path"）。- **ExternalSpec** （*string*） - 外部源配置（JSON）。

**构建器方法：**

- `WithName(name string) *Schema`

    此方法设置 Collection 名称。

- `WithDescription(desc string) *Schema`

    此方法设置 Collection 描述。

- `WithAutoID(autoID bool) *Schema`

    此方法设置 Milvus 是否自动生成主键。

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    此方法启用或禁用动态字段。

- `WithExternalSource(externalSource string) *Schema`

    此方法设置源数据 URI，该 URI 类似于 AWS S3 对象路径。

- `WithExternalSpec(externalSpec string) *Schema`

    此方法将外部源配置设置为 JSON。外部源规范是一组次级参数：

    - **format** （*string*） -

        目标源数据文件的格式。可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **extfs** （*string*） -

        以字符串化 JSON 结构表示的外部文件系统设置。可选选项如下：

        - **access_key_id** （*string*） -

            对象存储服务的访问密钥 ID。

        - **access_key_val** （*string*） -

            对象存储服务的访问密钥值。

        - **cloud_provider** （*string*） -

            对象存储服务的云提供商。

        - **region** （*string*） -

            对象存储服务的区域。

        - **use_iam** （*string*） -

            是否使用 AWS IAM 进行存储桶访问身份验证。可选值为 `"true"` 或 `"false"`。

        - **iam_endpoint** （*string*） -

            AWS IAM STS Endpoint。

        - **use_ssl** （*string*） -

            是否使用 SSL 访问您的对象存储桶。可选值为 `"true"` 或 `"false"`。

        - **use_virtual_host** （*string*） -

            是否使用虚拟主机方式访问存储桶。有关详细信息，请参见[这篇文章](https://docs.aws.amazon.com/AmazonS3/latest/userguide/VirtualHosting.html)。

        - **storage_type** （*string*） -

            存储类型。可选值为 `remote`。

        - **role_arn** （*string*） -

            从存储桶所有者处获取的 AWS IAM Role ARN。

        - **external_id** （*string*） -

            从存储桶所有者处获取的外部 ID。

        - **load_frequency** （*string*） -

            Milvus 获取临时身份验证凭据的时间间隔，单位为秒。

- `WithField(field *Field) *Schema`

    此方法将字段定义追加到 Schema。

- `WithFunction(function *Function) *Schema`

    此方法将内置函数定义追加到 Schema。

- `Validate() error`

    此方法校验结构体数组子字段，并在遇到不支持的嵌套或仅限顶层使用的标志时返回错误。

- `PKFieldName() string`

    此方法返回主键字段名称。

- `PKField() *Field`

    此方法返回主键字段定义。

## 示例\{#example}

演示 Schema 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err := schema.Validate()
fmt.Println(err)
```

- `WithExternalSource(externalSource string)`

    此方法设置源数据 URI，该 URI 应为可访问外部卷的名称。

- `WithExternalSpec(externalSpec string)`

    外部源规范，是一组次级参数：

    - **format** （*string*） - 

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    
