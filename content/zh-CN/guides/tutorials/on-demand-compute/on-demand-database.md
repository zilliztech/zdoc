---
title: "Database | Cloud"
slug: /on-demand-database
sidebar_key: on-demand-database
sidebar_label: "Database"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "按需计算中的数据库由平台管理，您无需为其预配置或维护集群。您可以指定按需计算集群，对这类数据库中的数据执行 Query 和 Search。详情请参见 Database 概述。 | Cloud"
type: origin
token: Do9cwkMFIi3TTRkK3fEcoRwJnq2
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 按需计算
  - database

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Database

按需计算中的数据库由平台管理，您无需为其预配置或维护集群。您可以指定按需计算集群，对这类数据库中的数据执行 Query 和 Search。详情请参见 [Database 概述](./database-concept)。

本指南说明如何管理按需计算中的数据库。

<Admonition type="info" icon="📘" title="说明">

此功能仅适用于**企业版**项目。

</Admonition>

## 使用限制\{#limitations}

- 您需要具备**项目管理员**权限才能管理 Database。

- 在每个项目中，最多可以在按需计算中创建 100 个 Database。

- 按需计算下的 Database 中所有 Collection（managed 或 [external](./external-collection)） 均不支持删除 Index。

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

    ![OLA2wpxPChsndxbih03c8lwnnrf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/OLA2wpxPChsndxbih03c8lwnnrf.png)

    <Procedures>

    1. 前往目标项目并点击**按需计算**。

    1. 点击 **Database**。

    1. 点击**创建 Database**。

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

    ![BfnGwj1m1hTvdDbZJrdcYvB3nId](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/BfnGwj1m1hTvdDbZJrdcYvB3nId.png)

## 删除 Database\{#drop-database}

<Admonition type="danger" icon="🚧" title="警告">

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

    ![OssbwyAK7h7JbzbgCbAcE1zAn1b](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/OssbwyAK7h7JbzbgCbAcE1zAn1b.png)

    