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

This topic describes how to create a cluster.

## Prerequisites{#prerequisites}

Ensure:

- Cloud activation. Refer to [Activate Your Cloud](./activate-your-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [User Roles](./user-roles).

## Create a cluster{#create-a-cluster}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the desired organization and project.

1. Click **+ Create Cluster**.

    ![create_cluster_01](/byoc/create_cluster_01.png)

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

            Clusters with **1-8 CUs** typically use a single-node setup suitable for smaller datasets. Clusters with more than **8 CUs** adopt a distributed multi-server node architecture to improve performance and scalability.

            </Admonition>

    - **Cloud Backup**: Decide whether to enable automatic cloud backup for safeguarding the data stored within your cluster, ensuring data persistence and recovery capabilities in case of failures.

1. Click **Create Cluster**. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

</TabItem>

<TabItem value="Bash">

Your request should resemble the following example, where `{CLOUD_REGION_ID` is the ID of the cloud region where the cluster resides and `{API_KEY}` is your API key used for authentication.

The following `POST` request takes a request body and creates a cluster named `cluster-02` with one Performance-optimized [CU](./cu-types-explained).

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