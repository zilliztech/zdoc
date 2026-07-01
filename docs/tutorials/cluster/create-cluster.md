---
title: "Create Cluster | Cloud"
slug: /create-cluster
sidebar_key: create-cluster
sidebar_label: "Create Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides various serving cluster deployment options to accommodate the distinct business needs. | Cloud"
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

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Create Cluster

Zilliz Cloud provides various serving cluster deployment options to accommodate the distinct business needs. 

- **Free**: provides a starting point for learning and personal projects with limitations on storage, vCU consumption, and the number of collections.

- **Serverless**: provides a shared environment that automatically scales to match your workload - no need to provision resources. This option delivers excellent cost efficiency and elasticity for unpredictable or spiky traffic.

- **Dedicated**: provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications.

For a detailed explanation of each deployment option, see [Zilliz Cloud Pricing](https://zilliz.com/pricing).

This topic describes how to create a cluster.

## Prerequisites\{#prerequisites}

Ensure:

- Registration with Zilliz Cloud. Refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [Access Control](./access-control).

## Create a Free cluster\{#create-a-free-cluster}

<Admonition type="info" icon="📘" title="Notes">

<p>Each organization can only have 1 free cluster. For additional clusters, opt for the Serverless or Dedicated.</p>

</Admonition>

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

The following demo shows how to create a **Free** cluster.

<Supademo id="cmhixdror61dofati1xmaai6j?utm_source=link" title=""  />

While the cluster is being created, you need to save the cluster credentials (user and password) which will be shown only once. 

When the cluster status turns into "Running", the cluster is created successfully. You can then copy the cluster endpoint and token and use them to [connect](./connect-to-cluster) to the cluster.

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

For further details, see [Create Free Cluster](/reference/restful/create-free-cluster-v2).

</TabItem>

</Tabs>

## Create a Serverless cluster\{#create-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

The following demo shows how to create a **Serverless** cluster.

<Supademo id="cmhixpd150ajjvc0i1t95ihdr?utm_source=link" title=""  />

While the cluster is being created, you need to save the cluster credentials (user and password) which will be shown only once. 

When the cluster status turns into "Running", the cluster is created successfully. You can then copy the cluster endpoint and token and use them to [connect](./connect-to-cluster) to the cluster.

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

For further details, see [Create Serverless Cluster](/reference/restful/create-serverless-cluster-v2).

</TabItem>

</Tabs>

## Create a Dedicated cluster\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

The following demo shows how to create a **Dedicated** cluster.

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

You need to configure the following information of the Dedicated cluster.

<table>
   <tr>
     <th><p><strong>Parameter</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Cluster Name</strong></p></td>
     <td><p>Assign a unique identifier for your cluster.</p></td>
   </tr>
   <tr>
     <td><p><strong>Cluster Description (optional)</strong></p></td>
     <td><p>Enter the description of your cluster, up to 255 characters.</p></td>
   </tr>
   <tr>
     <td><p><strong>Cluster Type</strong></p></td>
     <td><p>Select a cluster type that aligns with your cluster's performance requirements. For more information, refer to <a href="./cu-types-explained">Select the Right Cluster Type</a>. To select a Tiered-storage cluster, your cluster must have at least 8 query CUs.</p></td>
   </tr>
   <tr>
     <td><p><strong>Query CU</strong></p></td>
     <td><p>Select the number of query CUs of the cluster. For organizations created with a personal email address, the maximum query CU size for a Dedicated cluster is 32, even if a payment method is configured.</p></td>
   </tr>
   <tr>
     <td><p><strong>Backup Policy (optional)</strong></p></td>
     <td><p>Decide the automatic backup policy for the cluster to create. For more details about the backup policy, see <a href="./schedule-automatic-backups">Schedule Automatic Backups</a>.</p></td>
   </tr>
</table>

While the cluster is being created, you need to save the cluster credentials (user and password) which will be shown only once. 

When the cluster status turns into "Running", the cluster is created successfully. You can then copy the cluster endpoint and token and use them to [connect](null) to the cluster.

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

- `cuType`: The type of the cluster. Valid values: Performance-optimized, Capacity-optimized, and Tiered-storage.

- `cuSize`: The number of query CUs used for the cluster. Value range: 1 to 256. For organizations created with a personal email address, the maximum query CU size for a Dedicated cluster is 32, even if a payment method is configured.

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

## Create an encrypted cluster\{#create-an-encrypted-cluster}

To create an encrypted cluster, you need to add at least a customer-managed encryption key (CMEK) to Zilliz Cloud. For details, refer to [Customer-managed Keys for Data Encryption](./cmek).

<Admonition type="info" icon="📘" title="Notes">

This feature is available only to **Dedicated** clusters in a **Business Critical** project.

</Admonition>

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

Once you have added a KMS key, you can create an encrypted cluster as follows:

<Procedures>

1. Click **Dedicated** in the **Choose Deployment Option** section.

1. Choose the cloud provider and region for the cluster.

1. Enable **Encryption at Rest with CMEK** and select an existing KMS key. Only a KMS key in the same region as the cluster to create can be selected.

1. Review the summary, then click **Create Cluster**.

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    On the **Overview** page of an encrypted cluster, there is a key icon to the right of the cluster name, as shown in the above figure. All collections created in an encrypted cluster are encrypted by default.

</Procedures>

## FAQ\{#faq}

**Can I specify the Milvus version when creating a cluster?**

No. Zilliz Cloud automatically provisions clusters on the latest supported Milvus version and keeps them up to date through managed rolling upgrades. If you need a specific version, [contact support](https://support.zilliz.com/hc/en-us/requests/new) and explain your use case.