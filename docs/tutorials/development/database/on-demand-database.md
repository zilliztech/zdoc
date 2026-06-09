---
title: "Database | Cloud"
slug: /on-demand-database
sidebar_label: "Database"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A database in on-demand compute is managed by the platform and does not require you to provision or maintain a cluster for it. You specify on-demand compute to perform query search on data in this type of database. For details, see Database Explained. | Cloud"
type: origin
token: Dln4wglKhi0ijkkHtCQcLGQpnnc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Database

A database in on-demand compute is managed by the platform and does not require you to provision or maintain a cluster for it. You specify on-demand compute to perform query search on data in this type of database. For details, see [Database Explained](./database-concept).

This guide explains how to manage a database in on-demand compute.

<Admonition type="info" icon="📘" title="Note">

<p>This feature is only available to <strong>Enterprise</strong> projects.</p>

</Admonition>

## Limitations\{#limitations}

- To manage databases in on-demand compute, you need to be a **Project Admin**.

- You can create up to 100 on-demand compute databases in each project.

- All collections ([managed](./manage-collections-sdks) or [external](./external-volume)) in an on-demand database do not support dropping indexes.

## Create database\{#create-database}

This type of database is project-level resource shared by all on-demand clusters in the project.

- **Via RESTful API**

    ```bash
    export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
    export TOKEN="YOUR_CLUSTER_TOKEN"
    
    curl --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/databases/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "dbName": "my_database"
    }'
    ```

- **Via web console**

    ![OisSw2P8QhBiYqbInlbc8lpKnHc](https://zdoc-images.s3.us-west-2.amazonaws.com/OisSw2P8QhBiYqbInlbc8lpKnHc.png)

    <Procedures>

    1. Navigate to your project and click **On-demand**.

    1. Then click **Databases**.

    1. Click **Create Database**.

    1. Enter a database name.

    1. Click **Create**.

    </Procedures>



## View databases\{#view-databases}

- **Via RESTful API**

    ```bash
    export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/databases/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{}'
    ```

- **Via web console**

    ![LBPOwbowXhS1e4b7dxxcAIxVnue](https://zdoc-images.s3.us-west-2.amazonaws.com/LBPOwbowXhS1e4b7dxxcAIxVnue.png)

## Drop database\{#drop-database}

<Admonition type="danger" icon="🚧" title="Warning">

<p>Once you drop a database, it is removed immediately and cannot be recovered. This action cannot be undone.</p>

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

    ![MR8pwmkRoh1cnvbcSPfcEiwan4g](https://zdoc-images.s3.us-west-2.amazonaws.com/MR8pwmkRoh1cnvbcSPfcEiwan4g.png)

    