---
title: "Create Cluster | BYOC"
slug: /create-cluster
sidebar_label: "Create Cluster"
beta: FALSE
notebook: FALSE
description: "This topic describes how to create a cluster. | BYOC"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - create

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Cluster

This topic describes how to create a cluster.

## Prerequisites{#prerequisites}

Ensure:

- A BYOC project. Refer to [Deploy BYOC on AWS](./deploy-byoc-aws) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [User Roles](./user-roles).

## Create a dedicated cluster{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the desired organization and project.

1. Click **Create Free Cluster**.

    ![create_serverless_dedicated_cluster_01](/byoc/create_serverless_dedicated_cluster_01.png)

1. On the **Create New Cluster** page, fill out the relevant parameters.

    ![cluster-cluster-byoc](/byoc/cluster-cluster-byoc.png)

    - **Cluster Name**: Assign a unique identifier for your cluster.

    - **Cloud Provider Settings**: Choose the cloud service provider and the specific region where your cluster will be deployed. With the BYOC license, only the AWS **us-west-2** region is currently supported. To request more cloud regions, [contact us](https://zilliz.com/cloud-region-request?firstname=Li&lastname=Yun&company=zilliz&name=zilliz&email=leryn.li@zilliz.com&fullname=Li%20Yun&phone=--&country=China&requested_csp_provider=AWS).

    - **CU Settings**:

        - **CU Type**: Select a CU Type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right CU](./cu-types-explained).

        - **CU Size**: Select the total size of the cluster in terms of CUs.

        - **Topology**: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

            - **Proxy**: Stateless nodes that manage user connections and streamline service addresses with load balancers.

            - **Query Node**: Responsible for hybrid vector and scalar searches and incremental data updates.

            - **Coordinator**: The orchestration center, distributing tasks across worker nodes.

            - **Data Node**: Handles data mutations and log-to-snapshot conversions for persistence.

            <Admonition type="info" icon="📘" title="Notes">

            <p>Clusters with <strong>1-8 CUs</strong> typically use a single-node setup suitable for smaller datasets. Clusters with more than <strong>8 CUs</strong> adopt a distributed multi-server node architecture to improve performance and scalability.</p>

            </Admonition>

    - **Cloud Backup**: Decide whether to enable automatic cloud backup for safeguarding the data stored within your cluster, ensuring data persistence and recovery capabilities in case of failures.

1. Click **Create Cluster**. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where  `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a cluster named `cluster-02` with one Performance-optimized [CU](./cu-types-explained).

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