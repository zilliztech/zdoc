---
title: "阿里云对象存储 | BYOC"
slug: /integrate-with-alibaba-cloud-oss
sidebar_label: "阿里云对象存储"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍如何授权阿里云 BYOC 项目访问外部 OSS Bucket。您需要在 Bucket 所属阿里云账号中创建 RAM 权限策略和 RAM 角色，并使用 Zilliz Cloud 生成的可信主体与 External ID 配置信任策略。 | BYOC"
type: origin
token: R567wcMwgiiKkkkB1aKcWuCTnOb
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 阿里云对象存储

本文介绍如何授权阿里云 BYOC 项目访问外部 OSS Bucket。您需要在 Bucket 所属阿里云账号中创建 RAM 权限策略和 RAM 角色，并使用 Zilliz Cloud 生成的可信主体与 External ID 配置信任策略。

<Admonition type="info" icon="📘" title="说明">

Zilliz Cloud 通过 STS 扮演您创建的 RAM 角色，并使用短期凭证访问指定 Bucket。请勿向 Zilliz Cloud 提供阿里云账号或 RAM 用户的 AccessKey。

</Admonition>

## 访问流程\{#access-flow}

![SRysw6rYahYMBPbvJu8cnfgYn4g](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/SRysw6rYahYMBPbvJu8cnfgYn4g.png)

## 开始前准备\{#before-you-start}

请确保：

- 阿里云 BYOC 数据面处于运行状态。

- 您在 Zilliz Cloud 项目中拥有 Organization Owner 或 Project Admin 权限。

- 您可以在 Bucket 所属阿里云账号中创建自定义 RAM 权限策略和 RAM 角色。

- 目标 OSS Bucket 已创建，并与将访问它的 BYOC 数据面位于同一地域。

<Admonition type="info" icon="📘" title="说明">

创建集成时选择的 Zilliz Cloud 地域必须与 OSS Bucket 地域一致。请使用 OSS Region ID，例如 `cn-hangzhou`，不要填写 Endpoint 或可用区。

</Admonition>

## 步骤 1：在 Zilliz Cloud 中发起集成\{#start-integration}

<Procedures>

1. 登录 [Zilliz Cloud 控制台](https://cloud.zilliz.com.cn)。

1. 打开目标阿里云 BYOC 项目，在左侧导航中选择**集成**。

1. 找到**阿里云对象存储服务（OSS）**，单击**添加配置**。

1. 输入唯一的**配置名称**和可选的**配置描述**。

1. 选择 **Bucket 权限**：    

    - **只读**：用于 External Volume 或 External Collection。

    - **读写**：用于 Backup Export、Audit Log 或 Access Log 转发。

1. 单击**下一步**。

</Procedures>

## 步骤 2：指定外部 OSS Bucket\{#specify-bucket}

<Procedures>

1. 在 **Zilliz Cloud 集群地域**中选择将访问 Bucket 的 BYOC 数据面地域。

1. 打开 [OSS 管理控制台](https://oss.console.aliyun.com/bucket)，确认目标 Bucket 位于同一地域；如尚未创建，请先创建 Bucket。

1. 在 **Bucket 名称**中仅输入 Bucket 名称。不要输入 `oss://`、Endpoint、对象前缀或结尾斜杠。

1. 单击**下一步**。

</Procedures>

## 步骤 3：创建 RAM 权限策略\{#permission-policy}

<Procedures>

1. 打开 [RAM 访问控制 > 权限策略](https://ram.console.aliyun.com/policies)。

1. 单击**创建权限策略**，切换到**脚本编辑**。

1. 复制 Zilliz Cloud 中生成的 JSON 策略并粘贴到编辑器。以下为**读写**示例。

1. 将 `<BUCKET_NAME>` 替换为步骤 2 中的 Bucket 名称，然后保存策略。

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
            "acs:oss:oss-*:*:<BUCKET_NAME>",
            "acs:oss:oss-*:*:<BUCKET_NAME>/*"
          ]
        }
      ]
    }
    ```

    | 权限 | 用途 | 只读 | 读写 |
    | --- | --- | --- | --- |
    | `oss:ListObjects` | 列举 Bucket 中的对象和前缀。 | 需要 | 需要 |
    | `oss:GetObject` | 读取目标对象。 | 需要 | 需要 |
    | `oss:PutObject` | 写入导出文件或转发日志。 | 不需要 | 需要 |
    | `oss:GetBucketLocation` | 校验 Bucket 所在地域。 | 需要 | 需要 |
    | `oss:HeadBucket` | 检查 Bucket 是否存在且可访问。 | 需要 | 需要 |

    <Admonition type="info" icon="📘" title="说明">

    如果步骤 1 选择了**只读**，请使用 Zilliz Cloud 控制台生成的策略；该策略不包含 `oss:PutObject`。不要在控制台生成的策略之外扩大资源或操作范围。

    </Admonition>

</Procedures>

## 步骤 4：创建 RAM 角色并绑定权限策略\{#ram-role}

<Procedures>

1. 打开 [RAM 访问控制 > 角色](https://ram.console.aliyun.com/roles)，单击**创建角色**。

1. 选择**信任主体类型：云账号**。先按页面要求创建角色；下一步将使用 Zilliz Cloud 提供的精确信任主体更新信任策略。

1. 输入角色名称，例如 `ZillizExternalBucketRole`，完成创建。

1. 在角色详情页单击**新增授权**，绑定步骤 3 创建的自定义 RAM 权限策略。

1. 复制角色 ARN，并粘贴到 Zilliz Cloud 的**角色 ARN**字段。

    ```plaintext
    acs:ram::<CUSTOMER_ACCOUNT_ID>:role/<ROLE_NAME>
    ```

</Procedures>

## 步骤 5：配置角色信任策略\{#trust-policy}

<Procedures>

1. 在 RAM 角色详情页打开**信任策略**页签，单击**编辑信任策略**并切换到脚本编辑。

1. 返回 Zilliz Cloud，复制当前集成生成的 **Zilliz Cloud RAM 角色 ARN**和唯一 **External ID**。

1. 将这两个值填入下方信任策略并保存。不要修改 `Principal.RAM` 或 `sts:ExternalId` 的结构。

    ```json
    {
      "Statement": [
        {
          "Action": "sts:AssumeRole",
          "Effect": "Allow",
          "Principal": {
            "RAM": [
              "<ZILLIZ_CLOUD_RAM_ROLE_ARN>"
            ]
          },
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "<EXTERNAL_ID_FROM_ZILLIZ_CLOUD>"
            }
          }
        }
      ],
      "Version": "1"
    }
    ```

    <Admonition type="info" icon="📘" title="说明">

    不要复用其他项目、地域或 Bucket Integration 的角色 ARN 或 External ID。External ID 用于防止跨账号角色扮演中的 confused deputy 风险。

    </Admonition>

</Procedures>

## 步骤 6：校验并添加集成\{#validate}

<Procedures>

1. 返回 Zilliz Cloud，单击**校验集成**。

1. 如果 RAM 策略刚刚保存，请等待权限传播后重试校验。

1. 状态变为**校验成功**后，单击**添加**。该 OSS Bucket Integration 可供同一 Zilliz Cloud 项目和地域中的受支持工作流使用。

</Procedures>

## 安全建议\{#security}

- 为每个外部 Bucket 创建独立 RAM 角色和独立权限策略。

- 信任策略只允许 Zilliz Cloud 显示的具体 RAM 角色扮演，不要信任整个 Zilliz Cloud 阿里云账号。

- 始终保留 External ID 条件，并为每个集成使用不同的 External ID。

- 只读场景不要授予 `oss:PutObject`；任何场景都无需授予删除 Bucket、删除对象或管理 ACL 的权限。

- 若 Bucket 使用 KMS 加密、访问点、资源目录管控策略或防火墙，请另外确认这些策略允许目标数据路径。

## 问题排查\{#troubleshooting}

| 校验结果 | 可能原因 | 检查项 |
| --- | --- | --- |
| `assume role failed` | 角色 ARN、可信主体或 External ID 不匹配。 | 逐字符核对客户角色 ARN、`Principal.RAM` 和 `sts:ExternalId`，不要添加空格或复用旧值。 |
| `bucket region not match` | Bucket 地域与所选 BYOC 数据面地域不同。 | 在 OSS 控制台核对 Region ID，并在 Zilliz Cloud 选择完全相同的地域。 |
| `check bucket failed` | 角色缺少读取 Bucket 元数据的权限。 | 检查 `oss:GetBucketLocation`、`oss:HeadBucket` 及 Bucket Resource。 |
| 校验成功，但后续任务无法读写 | 对象权限与所选用途不一致，或有其他管控策略显式拒绝。 | 检查 `oss:GetObject`、`oss:ListObjects` 和读写场景中的 `oss:PutObject`。 |
