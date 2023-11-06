---
slug: /create-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Create Cluster

Zilliz Cloud provides various cluster plan tiers to accommodate the distinct business needs of users. For guidance on selecting an appropriate cluster type, consult [Free Trials](./free-trials) and [Understand Cluster Types](./select-zilliz-cloud-service-plans#understand-cluster-types).

## Prerequisites{#prerequisites}

Ensure:

- Registration with Zilliz Cloud. Refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud) for instructions.

- Ownership of the organization or project where the cluster is to be established. For details on roles and permissions, see [Users & Roles](./a-panorama-view).

## Set up a serverless cluster{#set-up-a-serverless-cluster}

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

    |  **Parameter**       |  **Description**                                                                                                                                                                                                                                                                                                                       |
    | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Collection name** |  The name of the collection.                                                                                                                                                                                                                                                                                                           |
    |  **Dimension**       |  The dimension of the vector data in the collection. The default value is 768.                                                                                                                                                                                                                                                         |
    |  **Metric Type**     |  The metric type measures the similarity between vectors. Valid values:<br/> <br/>  - Euclidean: measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors.<br/> <br/>  - Inner product: multiplies two vectors. The more positive the result, the more similar the two vectors.<br/>  |
    |  **Description**     |  The description of the collection. This parameter is optional.                                                                                                                                                                                                                                                                        |

1. Click **Create Collection and Cluster**.  A dialog box will display the public endpoint and API key for the cluster. Record these details for future access.

## Create a dedicated cluster{#create-a-dedicated-cluster}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Select the desired organization and project.

1. Click **+ Create Cluster**.
    ![create_cluster_01](/img/create_cluster_01.png)

1. On the **Create New Cluster** page, opt for the **Standard** or **Enterprise** plan and fill out the relevant parameters.

    |  **Parameter**                     |  **Description**                                                                                                                                      |
    | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Cluster Name**                  |  The name of the cluster.                                                                                                                             |
    |  **Cluster Username and Password** |  Credentials for access to this cluster.                                                                                                              |
    |  **Cloud Provider & Region**       |  The cluster's location and the cloud provider it is hosted on. For more information, see [Cloud Providers & Regions](./cloud-providers-and-regions). |
    |  **CU Type & Size**                |  The compute resource to be allocated to this cluster.                                                                                                |
    |  **Cloud Backup**                  |  Whether to enable cloud backup for the data in this cluster.                                                                                         |

    ![create-dedicated_cluster](/img/create-dedicated_cluster.png)

1. Click **Create Cluster**. You'll be redirected to a dialog showcasing the public endpoint and token for your cluster access. Keep these details safe.

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. A cluster in the **Running** state indicates successful creation.

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster) 

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection-1) 

- [Example Dataset](./example-dataset-1) 
