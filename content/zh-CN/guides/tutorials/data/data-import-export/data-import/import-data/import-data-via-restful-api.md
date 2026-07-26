---
title: "通过 RESTful API 导入 | Cloud"
slug: /import-data-via-restful-api
sidebar_key: import-data-via-restful-api
sidebar_label: "RESTful API"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文介绍如何通过 RESTful API 将数据导入现有 Collection 中。 | Cloud"
type: origin
token: FzANwnN8siARelkAp4vcJVJNnnf
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 导入
  - restful

---

import Admonition from '@theme/Admonition';


# 通过 RESTful API 导入

本文介绍如何通过 RESTful API 将数据导入现有 Collection 中。

## 开始前\{#before-you-start}

请确保已完成以下步骤：

- 已获取集群的 API 密钥。详情请参见[管理 API 密钥](./manage-api-keys)。

- 已创建 Collection，且该 Collection 的 Schema 与示例数据集相匹配。详情请参见[创建 Collection](./manage-collections-sdks)。

## 从 Volume 中导入数据\{#import-data-via-volume}

如需从 Volume 中导入数据，需要先创建 Volume 并将数据上传至该 Volume 中。在完成这些步骤后，记录文件在 Volume 中的位置，以备调用数据导入接口时使用。更多内容，可以参考管理 Volume (SDK)。

您可以参考如下代码完成从 Volume 中导入数据的操作。

```bash
curl --request POST \
--url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "inxx-xxxxxxxxxxxxxxx",
    "dbName": "default",
    "collectionName": "medium_articles",
    "partitionName": "",
    "volumeName": "my_volume",
    "dataPaths": [
        [
            "json-folder/1.json"
        ]
    ]
}'
```

如果需要将数据导入到指定 Partition，需要在请求中携带 `partitionName` 参数。

在 Zilliz Cloud 处理完上述请求后，您会获得一个任务 ID。使用该任务 ID，您可以在 Zilliz Cloud 控制台上监控任务的运行状态。

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

## 从外部存储导入数据\{#import-data-via-external-storage}

要从外部存储导入数据，需要先将数据上传到对象存储桶（如阿里云 OSS）。上传完成后，需获取文件路径和桶凭据，以便 Zilliz Cloud 从您的桶中提取数据。

有关如何获取文件 URL 和访问密钥，请参见：

- 阿里云：[获取单个或多个文件的 URL](https://help.aliyun.com/zh/oss/user-guide/how-to-obtain-the-url-of-a-single-object-or-the-urls-of-multiple-objects?spm=a2c4g.11186623.0.i18) 和[创建 Access Key](https://help.aliyun.com/document_detail/53045.html?spm=a2c4g.53045.0.0.718a7f80sYRRJB)。

- 腾讯云：[导出对象 URL](https://www.tencentcloud.com/zh/document/product/436/42391) 和[临时密钥生成及使用指引](https://cloud.tencent.com/document/product/598/37140)。

- 亚马逊云科技：[使用预签名 URL 共享对象](https://docs.amazonaws.cn/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html)和[使用长期凭证进行身份验证](https://docs.amazonaws.cn/sdkref/latest/guide/access-iam-users.html)。

根据您的数据安全需求，您也可以使用 [Session Token](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service)。

<Admonition type="info" icon="📘" title="说明">

为了成功导入数据，请确保目标 Collection 中的正在运行或待运行的导入任务不超过 10 个。

</Admonition>

一旦获取到文件路径和存储桶凭证，按以下方式调用 API：

```bash
# replace url and token with your own
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrl": "https://assets.zilliz.com/docs/example-data-import.json",
        "accessKey": "",
        "secretKey": ""
    }'
```

在上述代码中，`${CLOUD_REGION_ID}` 代表您集群所在的云地域的 ID，`${TOKEN}` 是用于授权 API 请求的集群 API 密钥，`${CLUSTER_ID}` 是您的集群的 ID。在调用 API 时，请确保将这些占位符替换为您的实际值。您可以从集群的公共访问端点获取 `CLOUD_REGION_ID` 和 `CLUSTER_ID`。例如，在公共访问端点 **https://in03-3bf3c31f4248e22.api.ali-cn-hangzhou.cloud.zilliz.com.cn** 中，`CLOUD_REGION_ID` 是 **ali-cn-hangzhou**，`CLUSTER_ID` 是 **in03-3bf3c31f4248e22**。

提交请求后，将返回任务 ID。您可以通过任务 ID 查询数据导入进度。示例代码如下：

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com.cn/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

有关更多信息，请参见[导入](/reference/restful/import)和[查看导入进度](/reference/restful/get-import-progress)。

## 结果验证\{#verify-the-result}

如果请求返回以下类似内容，则表示数据导入成功：

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

你也可以调用RESTful API获取[当前导入任务的进度](/reference/restful/get-import-job-progress-v2)，并[列出所有导入任务](/reference/restful/list-import-jobs-v2)以获取更多。作为替代方案，你也可以前往Zilliz Cloud控制台上的[任务中心](./job-center)查看结果和作业详情。

## 常见问题 \{#faq}

**使用 External Volume 与直接从外部存储中导入数据有何不同？**

两种方式都允许您从外部的云服务对象存储中导入数据。不同之处在于：

-  External Volume 通过存储集成来管理凭证。凭证只需配置一次，即可在多个 Volume 和操作中复用。数据工程师无需直接接触云存储密钥。

- 直接从外部存储导入时，需要在每次导入请求中提供凭证（access key、secret key）。这种方式更适合一次性导入，但不具备凭证隔离和复用能力。

