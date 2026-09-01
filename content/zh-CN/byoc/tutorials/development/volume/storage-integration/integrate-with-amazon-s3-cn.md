---
title: "Amazon S3 | BYOC"
slug: /integrate-with-amazon-s3-cn
sidebar_label: "Amazon S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何授权 Zilliz Cloud 亚马逊云科技（中国）BYOC 或 BYOC-I 项目访问外部 Amazon S3 Bucket。您需要在 Bucket 所属的中国区账号中创建客户管理的 IAM 权限策略和角色，再将角色注册到 Zilliz Cloud。 | BYOC"
type: origin
token: GlLAw4IUeiA2OfkM7ufcje9ZnIb
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Amazon S3

本文介绍如何授权 Zilliz Cloud 亚马逊云科技（中国）BYOC 或 BYOC-I 项目访问外部 Amazon S3 Bucket。您需要在 Bucket 所属的中国区账号中创建客户管理的 IAM 权限策略和角色，再将角色注册到 Zilliz Cloud。

<Admonition type="info" icon="📘" title="说明">

本文示例包含占位符。实际配置时，请复制 Zilliz Cloud 控制台生成的 JSON，其中包含正确的 Bucket 名称、`aws-cn` 分区可信主体和当前集成唯一的 External ID。

</Admonition>

## 访问流程\{#access-flow}

![EZabwQVSahHEzKbHk1pctqfCnc9](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/EZabwQVSahHEzKbHk1pctqfCnc9.png)

## 开始前准备\{#before-you-start}

请确保：

- 亚马逊云科技（中国）BYOC 或 BYOC-I 数据面处于运行状态。

- 您在 Zilliz Cloud 项目中拥有 Organization Owner 或 Project Admin 权限。

- 您可以在 Bucket 所属的亚马逊云科技（中国）账号中创建 IAM 权限策略和角色。

- 目标 S3 Bucket 与将访问它的 BYOC 数据面位于同一中国区 Region。

- Bucket、客户 IAM 角色和 Zilliz Cloud 提供的可信主体都属于 `aws-cn` 分区。中国区账号与 AWS 全球区域账号相互独立，不能跨分区建立 IAM 信任。

<Admonition type="info" icon="📘" title="说明">

Bucket Integration 具有 Region 属性。中国（北京）Region ID 为 `cn-north-1`，中国（宁夏）Region ID 为 `cn-northwest-1`。如果项目在多个 Region 部署数据面，请分别创建 Bucket 和集成。

</Admonition>

## 步骤 1：在 Zilliz Cloud 中发起集成\{#start-integration}

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn)。

1. 打开目标 BYOC 项目，在左侧导航中选择**集成**。

1. 找到 **Amazon S3**，单击**添加配置**。

1. 输入唯一的**配置名称**和可选的**配置描述**。

1. 根据用途选择 **Bucket 权限**。    

    | Bucket 权限 | 适用场景 | 授予的操作 |
    | --- | --- | --- |
    | **只读** | External Volume 和 External Collection | `s3:GetObject`、`s3:ListBucket` 和 `s3:GetBucketLocation` |
    | **读写** | Backup Export、Audit Log 和 Access Log 转发 | 只读操作以及 `s3:PutObject` |

</Procedures>

## 步骤 2：指定外部 S3 Bucket\{#identify-bucket}

<Procedures>

1. 在 **Region** 中选择将访问 Bucket 的 BYOC 数据面 Region。

1. 在 [Amazon S3 控制台（中国区）](https://console.amazonaws.cn/s3/home)中确认目标 Bucket 位于同一 Region。    

    | Region | Region ID | S3 区域 Endpoint |
    | --- | --- | --- |
    | 中国（北京） | `cn-north-1` | `s3.cn-north-1.amazonaws.com.cn` |
    | 中国（宁夏） | `cn-northwest-1` | `s3.cn-northwest-1.amazonaws.com.cn` |

1. 在 **Bucket 名称**中仅输入 Bucket 名称。不要输入 `s3://`、`.amazonaws.com.cn` Endpoint、对象前缀或结尾斜杠。

1. 单击**下一步**。Zilliz Cloud 将生成仅限该 Bucket 的 IAM 权限策略。

</Procedures>

## 步骤 3：创建 IAM 权限策略\{#permission-policy}

<Procedures>

1. 在 Zilliz Cloud 的**创建 IAM 权限策略**步骤中复制生成的 JSON。

1. 在 Bucket 所属中国区账号中打开 [IAM > 权限策略](https://console.amazonaws.cn/iam/home#/policies)。

1. 单击**创建策略**，选择 **JSON** 编辑器并粘贴生成的策略。

1. 单击**下一步**，输入便于识别的名称，例如 `ZillizBucketIntegration-my-bucket`，然后创建策略。

</Procedures>

以下示例展示两种权限级别对应的策略。中国区 S3 资源 ARN 必须以 `arn:aws-cn:s3` 开头。

### 读写策略\{#policy-read-write}

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
        "arn:aws-cn:s3:::<BUCKET_NAME>",
        "arn:aws-cn:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

### 只读策略\{#policy-read-only}

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws-cn:s3:::<BUCKET_NAME>",
        "arn:aws-cn:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

<Admonition type="info" icon="📘" title="说明">

如果 Bucket 使用客户管理的 AWS KMS 密钥进行服务端加密，还需向角色授予必要的 KMS 权限，并在 KMS Key Policy 中允许该角色。写入场景通常还需要对目标密钥授予 `kms:GenerateDataKey`。

</Admonition>

## 步骤 4：创建 IAM 角色和信任策略\{#trust-policy}

<Procedures>

1. 返回 Zilliz Cloud，单击**下一步**进入**创建 IAM 角色**步骤。

1. 复制生成的自定义信任策略。该策略包含所选 BYOC 数据面的中国区 IAM 主体和当前集成唯一的 External ID。

1. 在 Bucket 所属中国区账号中打开 [IAM > 角色](https://console.amazonaws.cn/iam/home#/roles)，单击**创建角色**。

1. 选择**自定义信任策略**，粘贴生成的 JSON，然后单击**下一步**。

1. 绑定步骤 3 创建的 IAM 权限策略。

1. 输入角色名称，例如 `ZillizBucketIntegrationRole`，检查配置并创建角色。    

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Principal": {
            "AWS": "arn:aws-cn:iam::<ZILLIZ_CHINA_ACCOUNT_ID>:role/<ZILLIZ_BYOC_ROLE_NAME>"
          },
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "<ZILLIZ_GENERATED_EXTERNAL_ID>"
            }
          }
        }
      ]
    }
    ```

</Procedures>

<Admonition type="info" icon="📘" title="说明">

**不要修改或复用 External ID**

External ID 将角色与当前集成绑定，用于降低跨账号访问中的 confused deputy 风险。可信主体必须是 Zilliz Cloud 显示的完整 `arn:aws-cn:iam::...` ARN；不要改成 `arn:aws:iam::...`，也不要使用其他项目或集成的值。

</Admonition>

## 步骤 5：校验并添加集成\{#validate}

<Procedures>

1. 在 IAM 角色详情页复制角色 ARN。中国区角色 ARN 格式为：`arn:aws-cn:iam::<BUCKET_ACCOUNT_ID>:role/<ROLE_NAME>`。

1. 返回 Zilliz Cloud，将该 ARN 粘贴到**角色 ARN**字段。

1. 单击**校验集成**。

1. 状态变为**校验成功**后，单击**添加**。该 Amazon S3 Bucket Integration 可供同一 Zilliz Cloud 项目和中国区 Region 中的受支持工作流使用。

</Procedures>

## 安全建议\{#security}

- 为每个 Bucket Integration 创建独立的 IAM 角色，并使用当前集成唯一的 External ID。

- 权限策略仅授权目标 Bucket；除非工作流必须写入对象，否则选择**只读**。

- 保持 S3 阻止公有访问功能开启。Bucket Integration 不要求 Bucket 公开访问。

- 不要向 Zilliz Cloud 提供长期 Access Key。Zilliz Cloud 通过 STS 扮演客户角色并使用临时安全凭证。

- 确保可信主体、客户角色、S3 和 KMS 资源 ARN 都使用 `aws-cn` 分区。

- 如果账号存在权限边界、S3 Bucket Policy 或 KMS Key Policy，请确认它们没有显式拒绝该角色所需的操作。

## 问题排查\{#troubleshooting}

| 校验结果 | 可能原因 | 检查项 |
| --- | --- | --- |
| `bucket region not match` | Bucket 与所选 BYOC 数据面不在同一 Region。 | 核对 `cn-north-1` 或 `cn-northwest-1`，并选择完全一致的 Region。 |
| `NoSuchBucket` | Bucket 名称错误，或 Bucket 已不存在。 | 仅填写准确的 Bucket 名称，不要包含 `s3://`、Endpoint 或对象路径。 |
| `AccessDenied` for `GetBucketLocation` | IAM 权限策略缺失、未绑定，或被其他策略拒绝。 | 确认角色对目标 `arn:aws-cn:s3:::<BUCKET_NAME>` 拥有 `s3:GetBucketLocation`，并检查权限边界和 Bucket Policy。 |
| 角色扮演失败 | 角色 ARN、可信主体、ARN 分区或 External ID 不匹配。 | 重新复制 Zilliz Cloud 生成的信任策略，确认双方 ARN 均以 `arn:aws-cn:` 开头，并核对客户角色所属账号。 |
| 连接到了错误的服务 Endpoint | 配置使用了全球区域的 `amazonaws.com` Endpoint。 | 中国区 S3 和 STS Endpoint 的域名后缀应为 `amazonaws.com.cn`；在 Zilliz Cloud 中填写 Bucket 名称和 Region，不要手动填写全球 Endpoint。 |

