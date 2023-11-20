---
slug: /docs/byoc/create-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Create Cluster

This topic describes how to create a cluster.

## Prerequisites{#prerequisites}

Ensure:

- Cloud activation. Refer to [Activate Your Cloud](./activate-your-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [Users & Roles](./a-panorama-view).

## Create a cluster{#create-a-cluster}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Select the desired organization and project.

1. Click **+ Create Cluster**.
    ![create_cluster_01](/byoc/create_cluster_01.png)

1. On the **Create New Cluster** page, fill out the relevant parameters.

    |  **Parameter**               |  **Description**                                                                                                                                                     |
    | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Cluster Name**            |  The name of the cluster.                                                                                                                                            |
    |  **Cloud Provider Settings** |  The cluster's location and the cloud provider it is hosted on. |
    |  **CU Settings**             |  The compute resource to be allocated to this cluster.                                                                                                               |
    |  **Cloud Backup**            |  Whether to enable cloud backup for the data in this cluster.                                                                                                        |

    

1. Click **Create Cluster**. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. A cluster in the **Running** state indicates successful creation.

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster) 

- [Create Collection](./create-collection) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection) 

- [Example Dataset](./example-dataset) 
