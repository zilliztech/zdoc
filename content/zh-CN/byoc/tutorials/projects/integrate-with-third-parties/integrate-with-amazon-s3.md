---
title: "Amazon S3 | BYOC"
slug: /integrate-with-amazon-s3
sidebar_label: "Amazon S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持与 Amazon Simple Storage Service（Amazon S3） 集成，用于转发审计日志或导出备份文件至指定的 S3 存储桶。 | BYOC"
type: origin
token: Bt3swdJKaigDQgkrzSwcoEEgnV4
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - amazon
  - s3
  - 配置对象存储

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Amazon S3

Zilliz Cloud 支持与 Amazon Simple Storage Service（[Amazon S3](https://docs.amazonaws.cn/AmazonS3/latest/userguide/Welcome.html)） 集成，用于转发审计日志或导出备份文件至指定的 S3 存储桶。

![MWh0wX3wehaH1dbkEXpc5GbFnoc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MWh0wX3wehaH1dbkEXpc5GbFnoc.png)

## 开始前\{#before-you-start}

- 要将 Zilliz Cloud 与 Amazon S3 集成，您需要拥有**组织管理员**或**项目管理员**权限。如果您权限不足，请联系您的 Zilliz Cloud 组织管理员。

- 您需要具有亚马逊云科技管理控制台的 Admin 权限。

## 步骤 1：集成基础设置\{#step-1-start-integration-on-zilliz-cloud}

<Supademo id="cmeksbxva065wv9kqaibjgsu1" title="步骤 1：集成基础设置" />

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)。

1. 进入目标项目，点击左侧导航栏的**集成中心**。

1. 在 **Amazon S3** 区域，点击**添加配置**。

1. 在弹出的对话框中，完成基础设置：

    - **配置名称**：为此集成设置一个唯一名称（如：`s3_integration_0820`）。

    - **配置描述**（可选）：为此集成添加描述（如：`for export backup file`）。

1. 点击**下一步**。在**创建 Amazon S3 存储桶**步骤中，完成以下操作：

    1. 在 **Zilliz Cloud 集群地域**选项中，选择 Zilliz Cloud 集群所在的云地域。之后创建的存储桶所在的云地域需与 Zilliz Cloud 集群所在的云地域相同。

    1. 打开 [Amazon S3 控制台](http://console.amazonaws.cn/s3)，继续执行[步骤 2](./integrate-with-amazon-s3#create-s3-bucket)。

</Procedures>

## 步骤 2：创建存储桶\{#create-s3-bucket}

<Supademo id="cmektshyv0755v9kq9nlj0ezm" title="步骤 2：创建存储桶（1）" />

<Procedures>

1. 登录到 [Amazon S3 控制台](http://console.amazonaws.cn/s3)。

1. 在页面顶部选择与你的 Zilliz Cloud 集群所在区域一致的 Amazon 云地域。

    <Admonition type="info" icon="📘" title="说明">

    <ul>
    <li><p>创建存储桶的云地域必须与 Zilliz Cloud 集群所在地域一致。Zilliz Cloud 支持的区域可参考<a href="./cloud-providers-and-regions">云服务提供商和地域</a>。</p></li>
    <li><p>如果集群运行在不同区域，需要分别为每个区域创建集成。</p></li>
    </ul>

    </Admonition>

1. 在左侧导航栏中，选择**存储桶**。

1. 在**通用存储桶**页面，选择**创建存储桶**。此时将打开**创建存储桶**页面。

1. 在**常规配置**中，设置**存储桶名称**（例如：`bucket-for-integration`），并记住该名称，后续步骤会用到。有关存储桶命名规则的完整列表，请参阅[通用存储桶命名规则](https://docs.amazonaws.cn/AmazonS3/latest/userguide/bucketnamingrules.html)。

1. 其余设置可保持默认，然后点击**创建存储桶**。

    有关更多信息，请参考[创建通用存储桶](https://docs.amazonaws.cn/AmazonS3/latest/userguide/create-bucket-overview.html)。

</Procedures>

存储桶创建完成后，返回 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，完成以下操作：

<Supademo id="cmekuujn107ekv9kqeucj7fkj" title="步骤 2：创建存储桶（2）" />

<Procedures>

1. 在**创建 Amazon S3 存储桶**步骤的**存储桶名称**字段中，输入刚才所创建的存储桶名称（本指南中为 `bucket-for-integration`）。然后点击**下一步**。

1. 在**创建 IAM 策略**步骤中，复制 JSON 策略。[步骤 3](./integrate-with-amazon-s3#create-iam-policy) 需要提供该内容。

1. 完成后打开 [IAM 控制台](https://console.amazonaws.cn/iam/home#/policies)，进入[步骤 3](./integrate-with-amazon-s3#create-iam-policy)。

</Procedures>

## 步骤 3：创建 IAM 策略\{#create-iam-policy}

为了让 Zilliz Cloud 访问 Amazon S3，需要创建一个 IAM 策略，包含必要的操作和资源权限，以便在 Zilliz Cloud 和 Amazon S3 存储桶之间转发审计日志或导出备份文件。

<Supademo id="cmekv5iab07fyv9kqpyyxb74m" title="步骤 3：创建 IAM 策略" />

<Procedures>

1. 在 [IAM 控制台](https://console.amazonaws.cn/iam/home#/policies)，选择 **策略 > 创建策略**。

1. 在策略编辑器中选择 **JSON** 选项。

1. 将[步骤 2](./integrate-with-amazon-s3#create-s3-bucket) 中 Zilliz Cloud 提供的 JSON 策略文档粘贴到编辑器中，然后点击**下一步**。

    示例 JSON 策略（实际策略以 Zilliz Cloud 控制台显示为准）：

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws-cn:s3:::<bucket>",
                    "arn:aws-cn:s3:::<bucket>/*"
                ]
            }
        ]
    }
    ```

    当您为上述对象存储桶启用了服务端加密，您还需要为 `kms:GenerateDataKey` 操作添加相应的策略。在此情况下，请使用如下 JSON 策略文件。

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws-cn:s3:::<bucket>",
                    "arn:aws-cn:s3:::<bucket>/*"
                ]
            },
            {
                "Sid": "AllowKMSGenerateDataKey",
                "Effect": "Allow",
                "Action": [
                    "kms:GenerateDataKey"
                ],
                "Resource": "arn:aws-cn:kms:<region>:<account-id>:key/<key-id>"
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="说明">

    <ul>
    <li><p><code>&lt;bucket&gt;</code> 需要替换为你的存储桶实际名称。</p></li>
    <li><p><code>&lt;region&gt;</code>, <code>&lt;account_id&gt;</code>, and <code>&lt;key_id&gt;</code> 需要替换为对应的值。详情请参考 AWS 文档中的<a href="https://docs.amazonaws.cn/kms/latest/developerguide/concepts.html">密钥标识符</a>一节的相关内容。</p></li>
    </ul>

    </Admonition>

1. 在**查看和创建**页面，输入策略名称（例如：`zilliz-policy-for-integration`）和可选描述，并检查权限是否正确。

1. 点击**创建策略**，完成后进入[步骤 4](./integrate-with-amazon-s3#create-iam-role)。

</Procedures>

## 步骤 4：创建 IAM 角色\{#create-iam-role}

创建 IAM 角色前，在 Zilliz Cloud 控制台完成以下操作：

<Supademo id="cmekvehv707lgv9kqxxwfkva2" title="步骤 4：创建 IAM 角色（1）" />

<Procedures>

1. 在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)，点击**下一步**，进入**创建 IAM 角色**步骤。

1. 在**选择可信实体**区域中，复制 JSON 格式的信任策略，然后打开 [IAM 控制台](https://console.amazonaws.cn/iam/)。

</Procedures>

之后，继续在 [IAM 控制台](https://console.amazonaws.cn/iam/)完成以下操作：

<Supademo id="cmekvgatu07nuv9kqcqtpdksi" title="步骤 4：创建 IAM 角色（2）" />

<Procedures>

1. 在  [IAM 控制台](https://console.amazonaws.cn/iam/)，选择**角色 > 创建角色**。

1. 在**可信实体类型**中，选择**自定义信任策略**类型。

1. 在自定义信任策略部分，粘贴 Zilliz Cloud 提供的 JSON 信任策略，然后点击**下一步**。

    示例 JSON 信任策略（实际以控制台为准）：

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Principal": {
                    "AWS": "306787409409"
                },
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "my-external-id"
                    }
                }
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="说明">

    <p><code>306787409409</code> 和 <code>my-external-id</code> 需要替换为控制台实际显示的亚马逊云科技账号 ID 和 External ID。</p>

    </Admonition>

1. 在**添加权限**步骤中，搜索并选择[步骤 3](./integrate-with-amazon-s3#create-iam-policy) 中创建的策略，然后点击**下一步**。

1. 在**命名、查看和创建**步骤中，输入角色名称并检查配置，最后点击**创建角色**。

1. 创建完成后，点击右上角的**查看角色**。

1. 在角色详情页面，复制该角色的 **ARN**，该 ARN 将在[步骤 5](./integrate-with-amazon-s3#step-5-validate-and-add-integration) 中使用。

</Procedures>

## 步骤 5：校验并添加集成\{#step-5-validate-and-add-integration}

<Supademo id="cmekvlcds07wmv9kq3zs95kl7" title="步骤 5：校验并添加集成" />

<Procedures>

1. 在 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn/login)的**创建 IAM 角色**步骤中，将从 IAM 控制台复制的 ARN 粘贴至 **角色** **ARN** 字段。

1. 点击**校验集成**。

1. 校验通过后，点击**添加**。

</Procedures>

之后您便可以转发审计日志或导出备份文件到您的 Amazon S3 存储桶。有关更多信息，请参考[审计日志](./audit-logs)或[导出备份文件](./export-backup-files)。

## 管理集成\{#manage-integrations}

集成添加完成后，您可以查看其详细信息或根据需要删除该集成。

![IohLb8sC2oQHLUxn4GzcDLF4nth](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/IohLb8sC2oQHLUxn4GzcDLF4nth.png)

### 获取集成 ID\{#obtain-the-integration-id}

如果您需要使用 RESTful API 接口导出文件到您集成到 Zilliz Cloud 的对象存储桶中，您可以单击**查看详情**查看该对象存储桶的集成详情并复制该桶的集成 ID。