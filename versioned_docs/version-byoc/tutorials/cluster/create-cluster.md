---
slug: /create-cluster
beta: FALSE
notebook: FALSE
type: origin
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

1. Click __+ Create Cluster__.

    ![create_cluster_01](/byoc/create_cluster_01.png)

1. On the __Create New Cluster__ page, fill out the relevant parameters.

    ![cluster-cluster-byoc](/byoc/cluster-cluster-byoc.png)

    - __Cluster Name__: Assign a unique identifier for your cluster.

    - __Cloud Provider Settings__: Choose the cloud service provider and the specific region where your cluster will be deployed. With the BYOC license, only the AWS __us-west-2__ region is currently supported. To request more cloud regions, [contact us](https://zilliz.com/cloud-region-request?firstname=Li&lastname=Yun&company=zilliz&name=zilliz&email=leryn.li@zilliz.com&fullname=Li%20Yun&phone=--&country=China&requested_csp_provider=AWS).

    - __CU Settings__:

        - __CU Type__: Select a CU Type that aligns with your cluster's performance requirements. For more information, refer to [Select the Right CU](./cu-types-explained).

        - __CU Size__: Select the total size of the cluster in terms of CUs.

        - __Topology__: A graphical representation showing the structure of your cluster. This includes the designation of roles and compute resources for various nodes:

            - __Proxy__: Stateless nodes that manage user connections and streamline service addresses with load balancers.

            - __Query Node__: Responsible for hybrid vector and scalar searches and incremental data updates.

            - __Coordinator__: The orchestration center, distributing tasks across worker nodes.

            - __Data Node__: Handles data mutations and log-to-snapshot conversions for persistence.

            <Admonition type="info" icon="📘" title="Notes">

            <p>Clusters with <strong>1-8 CUs</strong> typically use a single-node setup suitable for smaller datasets. Clusters with more than <strong>8 CUs</strong> adopt a distributed multi-server node architecture to improve performance and scalability.</p>

            </Admonition>

    - __Cloud Backup__: Decide whether to enable automatic cloud backup for safeguarding the data stored within your cluster, ensuring data persistence and recovery capabilities in case of failures.

1. Click __Create Cluster__. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

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

- `plan`: The plan tier of the Zilliz Cloud service you subscribe to. Valid values: __Standard__ and __Enterprise__.

- `clusterName`: The name of the cluster to create.

- `cuSize`: The size of the CU used for the cluster. Value range: 1 to 256. By calling `Create Cluster`, you can create a cluster with up to 32 CUs. To create a cluster with more than 32 CUs, [contact us](https://zilliz.com/contact-sales).

- `cuType`: The type of the CU used for the cluster. Valid values: __Performance-optimized__, __Capacity-optimized__, and __Cost-optimized__.

- `projectId`: The ID of the project in which you want to create a cluster. To list project IDs, call the `List Projects` operation.

</TabItem>

</Tabs>

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. A cluster in the __Running__ state indicates successful creation.