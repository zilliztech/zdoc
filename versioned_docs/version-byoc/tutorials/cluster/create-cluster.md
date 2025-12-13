---
title: "Create Cluster | BYOC"
slug: /create-cluster
sidebar_label: "Create Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
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
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Cluster

This topic describes how to create a cluster.

## Prerequisites\{#prerequisites}

Ensure:

- A BYOC project. Refer to [Deploy BYOC on AWS](./deploy-byoc-aws) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [Access Control](./access-control).

## Create a cluster\{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the desired organization and project.

1. Click **Create Cluster**.

    ![create-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-cluster-byoc.png "create-cluster-byoc")

1. On the **Create New Cluster** page, fill out the relevant parameters.

    ![cluster-cluster-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/cluster-cluster-byoc.png "cluster-cluster-byoc")

    - **Cluster Name**: Assign a unique identifier for your cluster.

    - **Cluster Settings**:

        - **Cluster Type**: Select a cluster type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right CU](./cu-types-explained).

        - **Query CU**: Select the number of query CUs of the cluster.

        - **Topology**: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

            - **Proxy**: Stateless nodes that manage user connections and streamline service addresses with load balancers.

            - **Query Node**: Responsible for hybrid vector and scalar searches and incremental data updates.

            - **Coordinator**: The orchestration center, distributing tasks across worker nodes.

            - **Data Node**: Handles data mutations and log-to-snapshot conversions for persistence.

    - (Optional) **Backup Policy**: Decide the backup frequency for the cluster to create. Zilliz Cloud will create a backup immediately after the cluster is created. Subsequent backups will follow the specified schedule.

1. Click **Create Cluster**. 

    You will be prompted to check the resource quota for your project. If the resources are sufficient, the dialog box will disappear after the check is complete. Otherwise, you can 

    - Click **Go To Project Resource Settings** to edit resource settings for the project, or

    - Click **Back to Last Step** to change your cluster settings.

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](https://zdoc-images.s3.us-west-2.amazonaws.com/zhzqbofkioabqnxkesycxgtnnwc.png "ZHZqbofKioaBqNxkeSYcXgtnnwc")

    <Admonition type="info" icon="📘" title="Notes">

    <p>Some additional resources will be required for rolling; these resources will be released after use.</p>

    </Admonition>

    Then, you'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where  `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a Performance-optimized  cluster named `cluster-02` with one query [CU](./cu-types-explained).

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

- `cuType`: The type of the cluster. Valid values: Performance-optimized, Capacity-optimized.

- `cuSize`: The number of query CUs used for the cluster. Value range: 1 to 256.

For further details, see [Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2).

</TabItem>

</Tabs>

