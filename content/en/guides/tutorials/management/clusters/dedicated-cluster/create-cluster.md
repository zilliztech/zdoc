---
title: "Create Cluster | Cloud"
slug: /create-cluster
sidebar_label: "Create Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A Dedicated cluster provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications. | Cloud"
type: origin
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Create Cluster

A Dedicated cluster provides isolated, reserved environments for production workloads that demand consistent and predictable performance. This option is ideal for sustained high-throughput and latency-sensitive applications.

<Admonition type="info" title="Notes">

This topic describes how to create a Dedicated cluster. To create a Free or Serverless cluster, see [Free & Serverless Clusters](./free-and-serverless-clusters).

</Admonition>

## Prerequisites\{#prerequisites}

Ensure:

- Registration with Zilliz Cloud. Refer to Register with Zilliz Cloud.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see Access Control Explained.

## Create a Dedicated cluster\{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"cURL","value":"Bash"}]}>

<TabItem value="Cloud Console">

The following demo shows how to create a **Dedicated** cluster.

<Supademo id="cmhixsdvu030hxj0imafwl2av" title=""  />

You need to configure the following information of the Dedicated cluster.

| **Parameter** | **Description** |
| --- | --- |
| **Cluster Name** | Assign a unique identifier for your cluster. |
| **Cluster Description (optional)** | Enter the description of your cluster, up to 255 characters. |
| <NextChannel action="include">**Milvus Version**</NextChannel> | <NextChannel action="include">Select a Milvus version for your Dedicated cluster. The stable (**GA**) version is selected by default and is recommended for production workloads. To try new features, select a version labeled **Public Preview**, which is suitable for evaluation and non-critical production workloads. Features may change before general availability.</NextChannel> |
| **Cluster Type** | Select a cluster type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right Cluster Type](./cu-types-explained). |
| **Query CU** | Select the number of query CUs of the cluster. For organizations created with a personal email address, the maximum query CU size for a Dedicated cluster is 32, even if a payment method is configured.<br/>If you are creating a cluster in an Enterprise project, auto-scaling is enabled by default. You can configure the minimum and maximum number of Query CUs for auto-scaling by entering values in the input boxes or dragging the slider. For details about auto-scaling, see [Auto-scaling](./auto-scaling). |
| **Backup Policy (optional)** | Decide the automatic backup policy for the cluster to create. For more details about the backup policy, see [Schedule Automatic Backups](./schedule-automatic-backups). |
| **Replica** | The number of replicas of the cluster. |

<NextChannel action="include">

<Admonition type="info" title="Notes">

- During the Milvus 3.0 public preview, Milvus 2.6 is selected by default. Select Milvus 3.0 to try its preview features. You cannot downgrade a Milvus 3.0 cluster to Milvus 2.6.

- Use an SDK version compatible with your cluster’s Milvus version. For details, see [SDK Compatibility](/docs/install-sdks#sdk-compatibility).

- Milvus 3.0 clusters cannot be converted to global clusters. If you plan to convert the cluster to a global cluster, select Milvus 2.6.

</Admonition>

</NextChannel>

While the cluster is being created, you need to save the cluster credentials (user and password) which will be shown only once. 

When the cluster status turns into "Running", the cluster is created successfully. You can then copy the cluster endpoint and token and use them to [connect](./connect-to-clusters) to the cluster.

</TabItem>

<TabItem value="Bash">

<NextChannel action="exclude">

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

- `cuSize`: The number of query CUs used for the cluster. Value range: 1 to 2,048. For organizations created with a personal email address, the maximum query CU size for a Dedicated cluster is 32, even if a payment method is configured.

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

</NextChannel>

<NextChannel action="include">

- **Create a Dedicated cluster with the default Milvus version**

    By default, Zilliz Cloud creates a Dedicated cluster with the stable (GA) Milvus version. You do not need to specify a Milvus version in your request.

    Your request should resemble the following example, where `{API_KEY}` is your API key used for authentication. For further details, see [Create Dedicated Cluster](/reference/restful/create-dedicated-cluster-v2).

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

    - `cuSize`: The number of query CUs used for the cluster. Value range: 1 to 2,048. For organizations created with a personal email address, the maximum query CU size for a Dedicated cluster is 32, even if a payment method is configured.

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

- **Create a Dedicated cluster with a specific Milvus version**

    To try new features available in a public preview version or match the Milvus version of a source cluster for data migration, you can select a specific Milvus version when creating a Dedicated cluster. 

    <Procedures>

    1. Retrieve the available Milvus versions using **List Milvus Version**.

        ```bash
        # TODO: Add a request to list available Milvus versions.
        ```

    1. Select a version from the response, then specify it in your cluster creation request.

        ```bash
        # TODO: Add a request to create a Dedicated cluster with the selected Milvus version.
        ```

    </Procedures>

    <Admonition type="info" title="Notes">

    - Public preview versions are suitable for evaluation and non-critical production workloads. Features may change before general availability.
    
    - You cannot downgrade a Milvus 3.0 cluster to Milvus 2.6.
    
    - Use an SDK version compatible with the selected Milvus version. For details, see [SDK Compatibility](/docs/install-sdks#sdk-compatibility).

    </Admonition>

</NextChannel>

</TabItem>

</Tabs>

## Create an encrypted cluster\{#create-an-encrypted-cluster}

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in AWS. It is not available on Google Cloud and Microsoft Azure.

</FeatureNote>

To create an encrypted cluster, you need to add at least a customer-managed encryption key (CMEK) to Zilliz Cloud. For details, refer to [Customer-managed Keys for Data Encryption](./cmek).

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

<NextChannel action="exclude">

**Can I specify the Milvus version when creating a cluster?**

No. Zilliz Cloud automatically provisions clusters on the latest supported Milvus version and keeps them up to date through managed rolling upgrades. If you need a specific version, [contact support](https://support.zilliz.com/hc/en-us/requests/new) and explain your use case.

</NextChannel>

<NextChannel action="include">

**Can I specify the Milvus version when creating a cluster?**

Yes. When multiple Milvus versions are available, you can select a version when creating a Dedicated cluster. The stable (GA) version is selected by default. During the Milvus 3.0 public preview, you can choose between Milvus 2.6 (GA) and Milvus 3.0 (Public Preview).

Version selection is not available for Free or Serverless clusters.

To upgrade an existing Dedicated cluster for public preview features, see [Manage Cluster](/docs/manage-cluster#upgrade-cluster-for-preview-features).

</NextChannel>

