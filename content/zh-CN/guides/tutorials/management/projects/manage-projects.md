---
title: "项目管理 | Cloud"
slug: /manage-projects
sidebar_label: "项目管理"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，项目位于组织和集群层级之间，用于分组集群、Volume 和相关资源。同一项目下所有资源都部署在同一云地域中。 | Cloud"
type: origin
token: KHwEwoWy3iSRO1kTpIjc21jNnsb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# 项目管理

在 Zilliz Cloud 中，项目位于组织和集群层级之间，用于分组集群、Volume 和相关资源。同一项目下所有资源都部署在同一云地域中。

您可以根据业务需求创建多个项目。例如，如果您的公司提供多媒体推荐服务，您可以为视频推荐服务创建一个项目，为音乐推荐服务创建另一个项目。本指南将介绍如何管理项目。

## 创建项目\{#create-a-project}

每个组织中默认自带项目 Default Project，其版本为**企业版**且不可删除。在注册账号完成后的引导流程中，您需要选择要部署工作负载的云地域，随后系统会在该地域自动创建该默认项目。您可以根据业务需求，自行创建更多项目。当您创建项目时，您也会成为该项目的[项目管理员](./project-users)。

### 限制\{#limits}

- 要创建项目，您必须是[组织管理员](./organization-users)。

- 每个组织中最多可创建 100 个项目。

### 操作步骤\{#procedures}

创建项目时，您需要输入项目名称并选择合适的项目版本。项目版本决定了可用功能特性与费用计算。如需了解不同版本的定价、版本差异以及如何选择合适的版本，请参考 [Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。如果您需要使用跨域多副本容灾、PITR、行级别权限（RLS）、CMEK、数据脱敏（Tokenization）、快照（Snapshot）等功能，请[联系我们](http://zilliz.com.cn/contact-sales)。

您可以通过 Web 控制台或 RESTful API 创建项目。

- **通过 web 控制台**

    <Supademo id="cmhiwl9xe5zyafati36cxl9ck" title=""  />

    <Procedures>

    1. 前往目标组织，在左侧导航中点击**项目**。

    1. 点击 **+ 项目**。

    1. 配置项目设置。

        下表说明了创建项目时使用的各项参数。

        | **参数** | **说明** |
        | --- | --- |
        | 版本 | 选择最适合您需求的项目版本。版本决定了可用功能和计费。详情请参见[Zilliz Cloud 版本对比](./select-zilliz-cloud-service-plans)。 |
        | 名称 | 输入要创建的项目名称。 |
        | 描述（可选） | 输入要创建的项目描述。最多 255 字符。 |
        | 地域 | 选择用于部署工作负载的云地域。项目中的所有资源（例如集群、Volume 等）都会部署在该地域。项目创建后，地域不可更改。详情请参见[选择合适的集群类型](./cu-types-explained)。 |
        | 多地域（可选） | 启用后，您可以在同一个项目中跨多个云地域部署资源。如果您计划使用[全球集群](./undefined)功能，则必须启用此选项。<br/>项目创建后，仍可稍后启用多地域。 |

    </Procedures>

- **通过 RESTful API**

    以下示例创建了一个名称为 `project-05` 的企业版项目。详情请参考[创建项目](https://docs.zilliz.com.cn/reference/restful/create-project-v2)。

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectName": "My Project",
        "plan": "Enterprise",
        "regionIds": [
            "aws-us-east-1"
        ],
        "description": "A project for organizing clusters and resources."
    }'
    ```

    以下为输出结果。

    ```bash
    {
      "code": 0,
      "data": [
        {
          "ProjectId": "proj-xxxxxxxxxxxxxxx"
        }
      ]
    }
    ```

## 添加项目地域\{#add-project-regions}

如果您需要使用[全球集群](./global-cluster-explained)功能，你必须创建多地域项目。您可以[联系我们](http://support.zilliz.com.cn)开通多地域项目的功能。

- **通过 RESTful API**

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
         --url "https://${BASE_URL}/v2/projects/proj-a0195d6acacaf2bb985173/regions" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         --data-raw '{
            "regions": ["gcp-us-west1"]
          }'
    ```

    以下为返回结果示例。

    ```bash
    {
      "code": 0,
      "data": {
        "projectId": "proj-a0195d6acacaf2bb985173",
        "regions": ["aws-us-west-2", "gcp-us-west1"]
      }
    }
    ```

- **通过 Web console**

    ![MHR4wgt3BhdGGjbvgp3crJmqnVf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/MHR4wgt3BhdGGjbvgp3crJmqnVf.png)

    <Procedures>

    1. 选择目标项目，并点击**...**

    1. 点击**添加区域**。

    1. 选择地域并点击**添加**。

    </Procedures>

## 查看全部项目\{#view-all-projects}

您可以查看在您的权限范围内的所有项目的列表。

- **通过 RESTful API**

    以下示例查看当前组织下的全部项目。详情请参考[查看项目列表](https://docs.zilliz.com.cn/reference/restful/list-projects-v2)。

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    以下为输出结果。

    ```bash
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "regionIds": [
                    "aws-us-east-1"
                ],
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise",
                "orgType": "SAAS",
                "description": "A project for organizing clusters and resources."
            }
        ]
    }
    ```

- **通过 Web 控制台**

    ![XJTIwuEapharu1bRUmCcICTsnEo](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/XJTIwuEapharu1bRUmCcICTsnEo.png)

## 查看项目详情\{#view-project-details}

您还可以查看某个项目的具体详情。

- **通过 RESTful API**

    以下示例查看项目 `proj-xxxxxxxxxxxxxxx` 的详细信息。详情请参考[查看项目详情](https://docs.zilliz.com.cn/reference/restful/describe-project-v2)。

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    以下为输出结果。

    ```json
    {
        "code": 0,
        "data": {
            "projectId": "proj-x",
            "projectName": "My Project",
            "regionIds": [
                "aws-us-east-1"
            ],
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise",
            "orgType": "SAAS",
            "description": "A project for organizing clusters and resources."
        }
    }
    ```

- **通过 Web 控制台**

    您可以在项目列表页查看项目名称、版本、集群数量、创建时间。您还可以点击某个项目，查看项目下的集群信息。

    ![LT20bwZ0lolQiqxAUC3cyc5dnAg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/lt20bwz0lolqiqxauc3cyc5dnag.png "LT20bwZ0lolQiqxAUC3cyc5dnAg")

## 编辑项目详情\{#edit-project-details}

要重命名项目或者修改项目描述，您必须是[组织管理员](./organization-users)。您可以通过 Web 控制台编辑项目详情。

<Supademo id="cmhiwsw4r607mfati5u089sae" title=""  />

## 删除项目\{#delete-a-project}

要删除项目，您必须是[组织管理员](./organization-users)。删除项目前，您需要先删除该项目下的所有[集群](./manage-cluster#drop-cluster)和 Volume。

项目一旦删除，该项目下的所有数据和资源将被清理。该操作不可撤销。

<Admonition type="info" icon="📘" title="📘 说明">

组织中的默认项目不可删除。

</Admonition>

您可以通过 Web 控制台删除项目。

<Supademo id="cmhiwxmer60exfati32g2fbdi?utm_source=link" title=""  />

## 常见问题\{#faq}

**能否降级项目版本？**                                                                                              暂不支持直接降级。如需切换至更低版本，请创建一个新项目并选择所需的版本，然后将数据[迁移](./offline-migration)至该项目。 

