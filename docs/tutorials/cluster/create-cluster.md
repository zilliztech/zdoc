---
slug: /create-cluster
beta: FALSE
notebook: FALSE
token: KrbjwFhy3iojF3k97XmcvvXMnW7
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Cluster

Zilliz Cloud provides various cluster plan tiers to accommodate the distinct business needs of users. For guidance on selecting an appropriate cluster type, consult [Free Trials](./free-trials) and [Understand Cluster Types](./select-zilliz-cloud-service-plans#understand-cluster-types).

This topic describes how to create a cluster.

## Prerequisites{#prerequisites}

Ensure:

- Registration with Zilliz Cloud. Refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [User Roles](./user-roles).

## Set up a serverless cluster{#set-up-a-serverless-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to [Zilliz Cloud console](https://cloud.zilliz.com/login) and log in.

1. Select the appropriate organization and project.

1. Click **+ Create Cluster**.

    ![create_cluster_01](/img/create_cluster_01.png)

1. In the **Create New Cluster** section, choose the **Starter** plan and fill in the required parameters. 

    <Admonition type="info" icon="📘" title="Notes">

    Each user is permitted one free serverless cluster. For additional clusters, opt for the Standard or Enterprise plans.

    </Admonition>

    |  **Parameter**               |  **Description**                                                                                                                                                                                                                        |
    | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Cluster Name**            |  Name of the cluster.                                                                                                                                                                                                                   |
    |  **Cloud Provider & Region** |  The cluster's location and the cloud provider it is hosted on. At present, our serverless clusters are available on Google Cloud Platform (GCP). For more information, see [Cloud Providers & Regions](./cloud-providers-and-regions). |

    ![create_cluster_02](/img/create_cluster_02.png)

1. Process with **Next: Create Collection**.

1. In the **Create Collection for Your New Cluster** section, select **New Collection**.

    ![create_cluster_03](/img/create_cluster_03.png)

    Specify the parameters for the new collection as below:

    |  **Parameter**       |  **Description**                                                                                                                                                                                                                                                                                                                      |
    | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Collection name** |  The name of the collection.                                                                                                                                                                                                                                                                                                          |
    |  **Dimension**       |  The dimension of the vector data in the collection. The default value is 768.                                                                                                                                                                                                                                                        |
    |  **Metric Type**     |  The metric type measures the similarity between vectors. Valid values:<br/> - Euclidean: measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors.<br/> - Inner product: multiplies two vectors. The more positive the result, the more similar the two vectors.<br/> |
    |  **Description**     |  The description of the collection. This parameter is optional.                                                                                                                                                                                                                                                                       |

1. Click **Create Collection and Cluster**. A dialog box will display the public endpoint and API key for the cluster. Record these details for future access.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{CLOUD_REGION_ID` is the ID of the cloud region where the cluster resides and `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a serverless cluster named `cluster-starter` in the project with ID `8342669010291064832`.

```bash
curl --request POST \
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/clusters/createServerless" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     --data-raw '{
     "clusterName": "cluster-starter",
     "projectId": "8342669010291064832"
     }'
     
# Sample output:
#{
#    "code": 200,
#    "data": {
#        "clusterId": "in03-36cab39b5ef7894",
#        "username": "db_36cab39b5ef7894",
#        "password": "Lb9.&N,9]Gd4pkp*",
#        "prompt": "Submission successful, Cluster is being created, You can use the DescribeCluster interface to obtain the creation progress and the status of the Cluster. When the Cluster status is RUNNING, you can access your vector database using the SDK with the admin account and the initialization password you provided."
#    }
#}
```

In the command above,

- `{CLOUD_REGION_ID`: The ID of the cloud region where you want to create a cluster. Currently, serverless clusters can be created only on GCP. To obtain available cloud region IDs, call the `List Cloud Regions` operation.

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `clusterName`: The name of the cluster to create.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the `List Projects` operation.

</TabItem>

</Tabs>

## Create a dedicated cluster{#create-a-dedicated-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the desired organization and project.

1. Click **+ Create Cluster**.

    ![create_cluster_01](/img/create_cluster_01.png)

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

Your request should resemble the following example, where `{CLOUD_REGION_ID` is the ID of the cloud region where the cluster resides and `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a dedicated cluster named `cluster-02` with one Performance-optimized [CU](./cu-types-explained).

```bash
curl --request POST \
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/clusters/create" \
     --header "Authorization: Bearer ${API_KEY}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     --data-raw '{
     "plan": "Standard",
     "clusterName": "cluster-02",
     "cuSize": 1,
     "cuType": "Performance-optimized",
     "projectId": "8342669010291064832"
     }'
     
# Sample output:
# {
#    "code": 200,
#    "data": {
#        "clusterId": "in01-4d71039fd8754a4",
#        "username": "db_admin",
#        "password": "Wu5@|71UG)[5zB9n",
#        "prompt": "Submission successful, Cluster is being created, You can use the DescribeCluster interface to obtain the creation progress and the status of the Cluster. When the Cluster status is RUNNING, you can access your vector database using the SDK with the admin account and the initialization password you provided."
#    }
#}
```

In the command above,

- `{CLOUD_REGION_ID`: The ID of the cloud region where you want to create a cluster. To obtain available cloud region IDs, call the `List Cloud Regions` operation.

- `{API_KEY}`: The credential used to authenticate API requests. Replace the value with your own.

- `plan`: The plan tier of the Zilliz Cloud service you subscribe to. Valid values: **Standard** and **Enterprise**.

- `clusterName`: The name of the cluster to create.

- `cuSize`: The size of the CU used for the cluster. Value range: 1 to 256. By calling `Create Cluster`, you can create a cluster with up to 32 CUs. To create a cluster with more than 32 CUs, [contact us](https://zilliz.com/contact-sales).

- `cuType`: The type of the CU used for the cluster. Valid values: **Performance-optimized**, **Capacity-optimized**, and **Cost-optimized**.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the `List Projects` operation.

</TabItem>

</Tabs>

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. A cluster in the **Running** state indicates successful creation.