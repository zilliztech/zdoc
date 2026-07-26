---
title: "按需计算中的 Database | Cloud"
slug: /on-demand-database
sidebar_label: "按需计算中的 Database"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "按需计算中的数据库由平台管理，您无需为其预配置或维护集群。您可以指定按需计算集群，对这类数据库中的数据执行 Query 和 Search。详情请参见 Database 概述。 | Cloud"
type: origin
token: CV70wkhwiiBsplkxFJicEbgEnab
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# 按需计算中的 Database

按需计算中的数据库由平台管理，您无需为其预配置或维护集群。您可以指定按需计算集群，对这类数据库中的数据执行 Query 和 Search。详情请参见 [Database 概述](./undefined)。

本指南说明如何管理按需计算中的数据库。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于**企业版**项目。

</Admonition>

## 使用限制\{#limitations}

- 您需要具备**项目管理员**权限才能管理 Database。如需了解角色权限，请参考[项目用户](./project-users#project-role-and-access-comparison)。

- 在每个项目中，最多可以在按需计算中创建 100 个 Database。

- 按需计算下的 Database 中所有 Collection（[Managed](./undefined) 或 [External](./undefined)） 均不支持删除 Index。

## 创建 Database\{#create-database}

这种类型的 Database 是项目级资源，由项目中的所有按需集群共享。

- **通过 RESTful API**

    ```bash
    export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com.cn"
    export TOKEN="YOUR_CLUSTER_TOKEN"
    
    curl --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/databases/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "dbName": "my_database"
    }'
    ```

- **通过 Web 控制台**

    ![ES5awFYfNhxHZdbokwScBvZ0nld](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ES5awFYfNhxHZdbokwScBvZ0nld.png)

    <Procedures>

    1. 前往目标项目并点击**按需计算**。

    1. 点击 **Database**。

    1. 点击树状结构中 **Database** 右侧的 **+** 。

    1. 输入 Database 名称。

    1. 点击**创建**。

    </Procedures>

## 查看 Database\{#view-databases}

- **通过 RESTful API**

    ```bash
    export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com.cn"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/databases/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{}'
    ```

- **Via web console**

    ![RqL0wIxUnhYhIgbzf0FcH6sZnlf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RqL0wIxUnhYhIgbzf0FcH6sZnlf.png)

    <Procedures>

    1. 前往项目，点击**按需计算资源**  **> Databases**。

    1. 查看 Database 列表。

    </Procedures>

## 删除 Database\{#drop-database}

<Admonition type="warning" icon="🚧" title="警告">

Database 会被立刻删除且无法恢复。该操作不可撤销。

</Admonition>

- **Via RESTful API**

    ```bash
    export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/databases/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "dbName": "my_database"
    }'
    ```

- **Via web console**

    ![AhaXwkMbihAfRQblQzicPGJqnYs](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/AhaXwkMbihAfRQblQzicPGJqnYs.png)

    <Procedures>

    1. 前往项目，点击**按需计算资源**  **> Databases**。

    1. 点击目标 Database, 点击 **...**, 选择**删除**。

    1. 输入 Database 名称。

    1. 点击**删除**。

    </Procedures>