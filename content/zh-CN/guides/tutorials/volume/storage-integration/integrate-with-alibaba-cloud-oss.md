---
title: "阿里云对象存储 | Cloud"
slug: /integrate-with-alibaba-cloud-oss
sidebar_label: "阿里云对象存储"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持与阿里云对象存储 OSS 集成。 | Cloud"
type: origin
token: IwAbwxWzQiGVc0khATdcOoCbnCg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 阿里云对象存储

Zilliz Cloud 支持与阿里云对象存储 OSS 集成。

该存储集成可用于：

- [External volumes](./external-volume)

- [导出备份文件](./export-backup-files)

- [转发审计日志](./audit-logs)

- [转发访问日志](./access-log-overview)

<Admonition type="info" icon="📘" title="说明">

此功能仅限**企业版**项目使用。

</Admonition>

![GPQdwo63IhxSjqbk9vkcdZQXngM](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/GPQdwo63IhxSjqbk9vkcdZQXngM.png)

## 开始前\{#before-you-start}

- 要将 Zilliz Cloud 与阿里云对象存储 OSS 集成，您需要拥有**组织管理员**或**项目管理员**权限。如果您权限不足，请联系 Zilliz Cloud 管理员。

- 您需要具备阿里云 **RAM 管理员**权限。有关更多信息，请参考 [RAM 基本概念](https://help.aliyun.com/zh/ram/product-overview/terms)。

## 步骤 1：集成基础设置\{#step-1-start-integration-on-zilliz-cloud}

![integrate-with-oss-1](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-1.png "integrate-with-oss-1")

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)。

1. 进入目标项目，点击左侧导航栏的**集成中心**。

1. 在**阿里云对象存储服务（OSS）**区域，点击 **+ 添加配置**。

1. 在弹出的对话框中，完成基础设置：

    - **配置名称**：为此集成设置一个唯一名称（如：`bucket_for_backup`）。

    - **配置描述**（可选）：为此集成添加描述（如：`for export backup file`）。

    - **Bucket 权限**：选择 Zilliz Cloud 对您的对象存储桶具有的访问级别。下表说明了这些选项。

        | **权限** | **说明** |
        | --- | --- |
        | 只读 | Zilliz Cloud 只能从存储桶中读取文件。用于为 External Collections 提供支持的 [External volumes](./external-volume)。 |
        | 读写 | Zilliz Cloud 既可以从 bucket 中读取数据，也可以向 bucket 中写入数据。用于[导出备份文件](./export-backup-files)、[转发审计日志](./audit-logs)或[转发访问日志](./access-log-overview)。 |

1. 继续执行[步骤 2](./integrate-with-alibaba-cloud-oss)。

</Procedures>

## 步骤 2：设置 OSS 存储空间\{#step-2-create-s3-bucket}

![integrate-with-oss-2](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-2.png "integrate-with-oss-2")

<Procedures>

1. 登录 [OSS 管理控制台](https://oss.console.aliyun.com/)。

1. 在左侧导航栏，单击 **Bucket 列表，**然后单击**创建 Bucket**。

1. 在**创建 Bucket** 面板，按如下说明配置各项参数。

    1. **Bucket 名称**：为您的 OSS 存储空间设置一个唯一名称。

    1. **地域**：指定存储空间所在的云地域。注意，存储空间所在地域必须和目标 Zilliz Cloud 集群或 Volume所在的地域相同。有关 Zilliz Cloud 支持的云地域，请参考[云服务提供商和地域](./cloud-providers-and-regions)。

    1. 其他设置可以保持默认。配置完成后，点击**完成创建**。

    有关更多创建信息，请参考[如何创建存储空间](https://help.aliyun.com/zh/oss/user-guide/create-a-bucket-4)。

1. 返回 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)。在**创建 OSS 存储空间（Bucket）**步骤中，选择刚才创建的 **Bucket 名称** 和 **Bucket 地域**。然后继续执行[步骤 3](./integrate-with-alibaba-cloud-oss)。

</Procedures>

## 步骤 3：创建权限策略\{#step-3-create-iam-policy}

要使 Zilliz Cloud 访问 OSS 存储空间，您需要创建一个权限策略。该策略应包含必要的操作权限和资源，确保 Zilliz Cloud 能顺利地与您的存储空间进行备份文件的传输。

![integrate-with-oss-3](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-3.png "integrate-with-oss-3")

为方便起见，可以使用脚本编辑器来创建权限策略。

<Procedures>

1. 在 [RAM 控制台](https://ram.console.aliyun.com/)，选择**权限管理 > 权限策略**。

1. 在**权限策略**页面，单击**创建权限策略**。

1. 在**创建权限策略**页面，单击**脚本编辑**页签。

1. 将 Zilliz Cloud 提供的策略内容复制并粘贴到脚本编辑器中。
以下是一个示例脚本策略。具体的策略内容，请以 Zilliz Cloud 控制台中**创建权限策略（RAM Policy）**步骤提供的内容为准。

    ```json
    {
      "Version": "1",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": [
            "oss:ListObjects",
            "oss:GetObject",
            "oss:PutObject",
            "oss:GetBucketLocation",
            "oss:HeadBucket"
          ],
          "Resource": [
            "acs:oss:oss-*:*:$bucket",
            "acs:oss:oss-*:*:$bucket/*"
          ]
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="说明">

    `$bucket` 应替换为您实际的 OSS 存储空间名称。

    </Admonition>

1. 在**创建权限策略**页面，单击**确定**。

1. 在**创建权限策略**对话框，输入权限策略**名称**和**备注**，然后单击**确定**。

</Procedures>

## 步骤 4：创建 RAM 角色\{#step-4-create-iam-role}

创建 RAM 角色，并将[步骤 3](./integrate-with-alibaba-cloud-oss) 中定义的权限策略赋予该角色。

<Procedures>

1. 在  [RAM 控制台](https://ram.console.aliyun.com/)，选择**角色** > **创建角色**。

1. 在**创建角色**页面，选择可信实体类型为**阿里云账号**，然后单击**下一步**。

1. 设置角色信息并单击**完成**。有关详细配置，请参考[创建可信实体为阿里云账号的RAM角色](https://help.aliyun.com/zh/ram/user-guide/create-a-ram-role-for-a-trusted-alibaba-cloud-account)。

1. 在**创建完成**步骤，点击**为角色授权**。

1. 在角色详情页面，复制角色 **ARN**，并将该 ARN 填入 Zilliz Cloud 控制台中**创建 RAM 角色**步骤的 **角色 ARN** 字段。

    ![integrate-with-oss-4](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-4.png "integrate-with-oss-4")

1. 在角色详情页面的**权限管理**页签，选择**新增授权**。

1. 在弹出的**新增授权**面板，搜索并选择[步骤 3](./integrate-with-alibaba-cloud-oss) 中创建的权限策略，然后点击**确认新增授权**，最后单击**关闭**。

1. 在角色详情页面的**信任策略**页签，编辑信任策略。将 Zilliz Cloud 控制台提供的 JSON 角色信任策略复制并粘贴到编辑器中。

    以下是示例角色信任策略。具体的策略内容，请以 Zilliz Cloud 控制台中**创建权限策略（RAM Policy）**步骤提供的内容为准。

    ```json
    {
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "zilliz-data-service"
            }
          },
          "Effect": "Allow",
          "Principal": {
            "RAM": [
              "acs:ram::1541183371417731:root"
            ]
          }
        }
      ],
      "Version": "1"
    }
    ```

1. 点击**保存信任策略**。然后继续执行[步骤 5](./integrate-with-alibaba-cloud-oss)。

    ![integrate-with-oss-5](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-5.png "integrate-with-oss-5")

</Procedures>

## 步骤 5：校验并创建集成\{#step-5-validate-and-create-integration}

<Procedures>

1. 在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，点击**校验集成**，验证当前配置的存储空间和 RAM 角色是否有效。

1. 校验通过后，点击**创建**。

</Procedures>

之后您便可以将备份文件导出到您的阿里云 OSS。有关导出的具体步骤，请参考[导出备份文件](./export-backup-files)。

## 调用接口创建存储集成\{#create-storage-integration-programmatically}

除了在 Zilliz Cloud 控制台上进行操作之外，您还可以调用接口创建存储集成。

<Procedures>

1. 创建 OSS 存储空间。

    更多详情，可参考上面的[设置 OSS 存储空间](./integrate-with-alibaba-cloud-oss#step-2-create-s3-bucket)小节或[创建存储空间](https://help.aliyun.com/zh/oss/user-guide/create-a-bucket-4)。

1. 生成鉴权材料。

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/authorizationMaterials" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "ali-cn-hangzhou",
        "bucketName": "zilliz-bucket-for-integration-0819"
    }'
    ```

    根据上述请求，Zilliz Cloud 会生成您在阿里云控制台上创建权限策略及 RAM 角色时所需的凭据。返回的响应如下：

    ```bash
    {
      "code": 0,
      "data": {
        "readonly": "{...}",
        "readwrite": "{...}",
        "ramPolicy": "{...}",
        "trustPolicy": "{...}",
        "zillizAccount": "306787409409",
        "externalId": "zilliz-external-AbCdEf12345678"
      }
    }
    ```

    关于请求及响应中各字段的说明，可以参考[生成 Storage Integration 授权材料](https://docs.zilliz.com.cn/reference/restful/generate-storage-integration-authorization-materials-v2)。

1. 使用返回的 `readonly`、`readwrite`、`ramPolicy`、`trustPolicy` 及 `zillizAccount` 创建 RAM 角色，并为其添加必要的权限，使其可以操作您的 OSS 存储空间。

    请记录下已创建的 RAM 角色 ARN，其格式类似 `acs:ram::1234567890123456:root`。关于如何创建 RAM 角色，可以参考[创建权限策略](./integrate-with-alibaba-cloud-oss#step-3-create-iam-policy)及[创建 RAM 角色](./integrate-with-alibaba-cloud-oss#step-4-create-iam-role)两小节的内容。

1. 验证使用上述凭据创建的 RAM 角色是否可以正常访问您的 OSS 存储空间。

    在请求中，您需要将 `externalCred.roleArn` 设置为上一步获得的 RAM 角色 ARN，并将 `externalCred.externalId` 设置为生成的授权材料中的 `externalId`。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/validate" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "ali-cn-hangzhou",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "acs:ram::1234567890123456:root",
            "externalId": "zilliz-external-AbCdEf12345678"
        }
    }'
    ```

    验证成功的响应如下：

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    关于请求及响应中各字段的说明，可以参考[校验 Storage Integration](https://docs.zilliz.com.cn/reference/restful/validate-storage-integration-v2)。

1. 创建存储集成。

    此请求在验证请求的基础上增加了 `description` 参数。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-oss",
        "description": "Alibaba OSS bucket for external tables",
        "regionId": "ali-cn-hangzhou",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "acs:ram::1234567890123456:root",
            "externalId": "zilliz-external-AbCdEf12345678"
        }
    }'
    ```

    上述请求的响应格式如下：

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-oss"
        }
    }
    ```

    关于请求及响应中各字段的说明，可以参考[创建 Storage Integration](https://docs.zilliz.com.cn/reference/restful/create-storage-integration-v2)。

</Procedures>

## 管理集成\{#manage-integrations}

集成添加完成后，您可以查看其详细信息或根据需要删除该集成。

![integrate-with-oss-6](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/integrate-with-oss-6.png "integrate-with-oss-6")

### 获取集成 ID\{#obtain-the-integration-id}

如果您需要使用 RESTful API 接口导出文件到您集成到 Zilliz Cloud 的对象存储桶中，您可以单击**查看详情**查看该对象存储桶的集成详情并复制该桶的集成 ID。

除此之外，您还可以执行如下命令获取集成 ID。

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

上述请求的响应如下：

```bash
{
    "code": 0,
    "data": {
        "storageIntegrations": [
            {
                "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
                "name": "analytics-oss",
                "status": "ACTIVE",
                "message": "",
                "regionId": "ali-cn-hangzhou",
                "bucketName": "my-bucket"
            }
        ],
        "count": 1,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

关于请求及响应中各字段的说明，可以参考[列出 Storage Integration](https://docs.zilliz.com.cn/reference/restful/list-storage-integrations-v2)。

### 查看集成详情\{#view-integration-details}

您还可以执行如下命令查看指定集成的详情。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

上述请求的响应如下：

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-oss",
        "description": "Alibaba OSS bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "ali-cn-hangzhou",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "acs:ram::1234567890123456:root",
            "externalId": "zilliz-external-AbCdEf12345678"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

关于请求及响应中各字段的说明，可以参考[查看 Storage Integration](https://docs.zilliz.com.cn/reference/restful/describe-storage-integration-v2)。

### 删除集成\{#delete-storage-integration}

除了可以在 Zilliz Cloud 控制台上单击删除按钮之外，您还可以执行如下命令来删除指定集成。

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

上述请求的响应如下：

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-oss"
    }
}
```

关于请求及响应中各字段的说明，可以参考[删除 Storage Integration](https://docs.zilliz.com.cn/reference/restful/delete-storage-integration-v2)。