---
title: "Create Cluster | BYOC"
slug: /create-cluster
sidebar_label: "Create Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A Dedicated cluster provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications. | BYOC"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Cluster

A Dedicated cluster provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications.

<Admonition type="info" icon="📘" title="Notes">

This topic describes how to create a Dedicated cluster. To create a Free or Serverless cluster, see [Free & Serverless Clusters](./free-and-serverless-clusters).

</Admonition>

## Prerequisites\{#prerequisites}

Ensure:

- A BYOC project. For details, refer to the following pages:

    - [Deploy BYOC on AWS](./deploy-byoc-aws)

    - [Deploy BYOC-I on AWS](./deploy-byoc-i-aws)

    - [Deploy BYOC on GCP](./deploy-byoc-gcp)

    - [Deploy BYOC-I on Microsoft Azure](./deploy-byoc-i-azure)

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see Access Control.

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

    - (Optional) **Cluster Description**: Enter the description of your cluster.

    - **Cluster Settings**:

        - **Cluster Type**: Select a cluster type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right CU](./cu-types-explained).

        - **Query CU**: Select the number of query CUs of the cluster.

        - **Topology**: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

            - **Proxy**: Stateless nodes that manage user connections and streamline service addresses with load balancers.

            - **Query Node**: Responsible for hybrid vector and scalar searches and incremental data updates.

            - **Coordinator**: The orchestration center, distributing tasks across worker nodes.

            - **Data Node**: Handles data mutations and log-to-snapshot conversions for persistence.

    - (Optional) **Backup Policy**: Decide the automatic backup policy for the cluster to create. For more details about the backup policy, see [Schedule Automatic Backups](./schedule-automatic-backups).

1. Click **Create Cluster**. 

    You will be prompted to check the resource quota for your project. If the resources are sufficient, the dialog box will disappear after the check is complete. Otherwise, you can 

    - Click **Go To Project Resource Settings** to edit resource settings for the project, or

    - Click **Back to Last Step** to change your cluster settings.

    ![ZHZqbofKioaBqNxkeSYcXgtnnwc](https://zdoc-images.s3.us-west-2.amazonaws.com/zhzqbofkioabqnxkesycxgtnnwc.png "ZHZqbofKioaBqNxkeSYcXgtnnwc")

    <Admonition type="info" icon="📘" title="Notes">

    Some additional resources will be required for rolling; these resources will be released after use.

    </Admonition>

    Then, you'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where  `{API_KEY}` is your API key used for authentication. For further details, see [Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2).

```bash
curl --request POST \
--url "${BASE_URL}/v2/clusters/createDedicated" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Accept: application/json" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json" \
-d '{
    "clusterName": "Cluster-05",
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "plan": "Standard",
    "cuType": "Performance-optimized",
    "cuSize": 1,
    "description": "A cluster for vector search workloads."
}'
```

In the command above,

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `clusterName`: The name of the cluster to create.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the [List Projects](/reference/restful/list-projects-v2) operation.

- `regionId`: The ID of the cloud region where you want to create a cluster. To obtain available cloud region IDs, call the [List Cloud Regions](/reference/restful/list-cloud-regions-v2) operation.

- `cuType`: The type of the cluster. Valid values: Performance-optimized, Capacity-optimized.

- `cuSize`: The number of query CUs used for the cluster. Value range: 1 to 256.

- `description` (optional): Description of the cluster.

The following is an example output.

```json
{
    "code": 0,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "username": "db_admin",
        "password": "****************",
        "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
    }
}
```

</TabItem>

</Tabs>

## FAQ\{#faq}

**Can I specify the Milvus version when creating a cluster?**

No. Zilliz Cloud automatically provisions clusters on the latest supported Milvus version and keeps them up to date through managed rolling upgrades. If you need a specific version, [contact support](https://support.zilliz.com/hc/en-us/requests/new) and explain your use case.