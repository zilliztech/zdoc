---
title: "Create Cluster | Cloud"
slug: /create-cluster
sidebar_label: "Create Cluster"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides various cluster plan tiers to accommodate the distinct business needs of users. For guidance on selecting an appropriate cluster type, consult Free Trials](./free-trials) and [Understand Cluster ](./select-zilliz-cloud-service-plans)[Plans. | Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - create
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Cluster

Zilliz Cloud provides various cluster plan tiers to accommodate the distinct business needs of users. For guidance on selecting an appropriate cluster type, consult [Free Trials](./free-trials) and [Understand Cluster ](./select-zilliz-cloud-service-plans)[Plans](./select-zilliz-cloud-service-plans).

This topic describes how to create a cluster.

## Prerequisites{#prerequisites}

Ensure:

- Registration with Zilliz Cloud. Refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [Access Control](./access-control).

## Set up a free cluster{#set-up-a-free-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to [Zilliz Cloud console](https://cloud.zilliz.com/login) and log in.

1. Select the appropriate organization and project.

1. Click **Create Free Cluster**.

    ![create_cluster_01](/img/create_cluster_01.png)

1. In the **Create New Cluster** section, choose the **Free** plan and fill in the required parameters. 

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each user is permitted one free cluster. For additional clusters, opt for the Serverless or Dedicated plans.</p>

    </Admonition>

    <table>
       <tr>
         <th><p><strong>Parameter</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Cluster Name</strong></p></td>
         <td><p>Name of the cluster.</p></td>
       </tr>
       <tr>
         <td><p><strong>Cloud Provider & Region</strong></p></td>
         <td><p>The cluster's location and the cloud provider it is hosted on. At present, our free clusters are available on Google Cloud Platform (GCP). For more information, see <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
       </tr>
    </table>

    ![create_cluster_02](/img/create_cluster_02.png)

1. Click **Create**. You'll be redirected to the **Cluster Details** page showcasing the public endpoint and API key for the cluster. Record these details for future access.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a free cluster named `cluster-free` in the project with ID `proj-xxxxxxxxxxxxxxxxxxxxx`.

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createFree" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-free",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "*************",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `clusterName`: The name of the cluster to create.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the [List Projects](/reference/restful/list-projects-v2) operation.

- `regionId`: The ID of the cloud region where you want to create a cluster. Currently, free clusters can be created only on GCP. To obtain available cloud region IDs, call the [List Cloud Regions](/reference/restful/list-cloud-regions-v2) operation.

</TabItem>

</Tabs>

## Set up a serverless cluster{#set-up-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to [Zilliz Cloud console](https://cloud.zilliz.com/login) and log in.

1. Select the appropriate organization and project.

1. Click **+ Cluster**.

    ![create_serverless_dedicated_cluster_01](/img/create_serverless_dedicated_cluster_01.png)

1. In the **Create New Cluster** section, choose the **Serverless** plan and fill in the required parameters. 

    <table>
       <tr>
         <th><p><strong>Parameter</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p><strong>Cluster Name</strong></p></td>
         <td><p>Name of the cluster.</p></td>
       </tr>
       <tr>
         <td><p><strong>Cloud Provider & Region</strong></p></td>
         <td><p>The cluster's location and the cloud provider it is hosted on. At present, our serverless clusters are available on Google Cloud Platform (GCP). For more information, see <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></td>
       </tr>
    </table>

    ![create_serverless_cluster_form](/img/create_serverless_cluster_form.png)

1. Click **Create**. You'll be redirected to the **Cluster Details** page showcasing the public endpoint and API key for the cluster. Record these details for future access.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a serverless cluster named `cluster-severless` in the project with ID `proj-xxxxxxxxxxxxxxxxxxxxx`.

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "cluster-serverless",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-west1"
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_xxxxxxxx",
#         "password": "***********",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `clusterName`: The name of the cluster to create.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the [List Projects](/reference/restful/list-projects-v2) operation.

- `regionId`: The ID of the cloud region where you want to create a cluster. Currently, free clusters can be created only on GCP. To obtain available cloud region IDs, call the [List Cloud Regions](/reference/restful/list-cloud-regions-v2) operation.

</TabItem>

</Tabs>

## Create a dedicated cluster{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the desired organization and project.

1. Click **+ Cluster**.

    ![create_serverless_dedicated_cluster_01](/img/create_serverless_dedicated_cluster_01.png)

1. On the **Create New Cluster** page, opt for the **Standard** or **Enterprise** plan and fill out the relevant parameters.

    ![create-dedicated_cluster](/img/create-dedicated_cluster.png)

    - **Cluster Name**: Assign a unique identifier for your cluster.

    - **Cloud Provider Settings**: Choose the cloud service provider and the specific region where your cluster will be deployed. For more information, see [Cloud Providers & Regions](./cloud-providers-and-regions).

    - **CU Settings**:

        - **CU Type**: Select a CU Type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right CU](./cu-types-explained).

        - **CU Size**: Select the total size of the cluster in terms of CUs.

    - **Cloud Backup**: Decide whether to enable automatic cloud backup for safeguarding the data stored within your cluster, ensuring data persistence and recovery capabilities in case of failures.

1. Click **Create Cluster**. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where  `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a dedicated cluster named `cluster-02` with one Performance-optimized [CU](./cu-types-explained).

```bash
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/clusters/createDedicated" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     --data-raw '{
        "clusterName": "Cluster-02",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1
    }'
     
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_admin",
#         "password": "****************",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `clusterName`: The name of the cluster to create.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the [List Projects](/reference/restful/list-projects-v2) operation.

- `regionId`: The ID of the cloud region where you want to create a cluster. To obtain available cloud region IDs, call the [List Cloud Regions](/reference/restful/list-cloud-regions-v2) operation.

- `plan`: The plan tier of the Zilliz Cloud service you subscribe to. Valid values: **Standard** and **Enterprise**.

- `cuType`: The type of the CU used for the cluster. Valid values: **Performance-optimized and **Capacity-optimized**.

- `cuSize`: The size of the CU used for the cluster. Value range: 1 to 256. By calling `Create Cluster`, you can create a cluster with up to 32 CUs. To create a cluster with more than 32 CUs, [contact us](https://zilliz.com/contact-sales).

</TabItem>

</Tabs>

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. A cluster in the **Running** state indicates successful creation.