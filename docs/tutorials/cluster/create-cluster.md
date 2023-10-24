---
slug: /create-cluster
beta: FALSE
notebook: FALSE
sidebar_position: 1
---



# Create Cluster

To meet the business needs of different users, Zilliz Cloud offers different plan tiers of clusters. For information on how to choose an appropriate cluster type, see [Free Trials](./free-trials) and [Cluster Types Explained](./cluster-types-explained) .

There are two types of clusters available, namely the serverless cluster and the dedicated cluster. This guide series introduces how to create a serverless cluster.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud. For information on how to register an account, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You are the owner of the organization or project in which you want to create a cluster. For information on roles and permissions, see [Users & Roles](./users-roles).

## Create a serverless cluster{#create-a-serverless-cluster}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization and project in which you want to create a cluster.

1. On the page that appears, click **+ Create Cluster**.
    ![create_cluster_01](/img/create_cluster_01.png)

1. On the **Create New Cluster** page, select the **Starter** plan and configure the following parameters. Currently, each user can create one serverless cluster for free. If you require additional clusters, we recommend subscribing to either our **Standard** or **Enterprise** plan.

    |  **Parameter**           |  **Description**                                                                                                                                  |
    | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Cluster Name            |  The name of the cluster.                                                                                                                         |
    |  Cloud Provider & Region |  The cluster's location and the cloud provider it is hosted on. At present, our serverless clusters are available on Google Cloud Platform (GCP). |

    ![create_cluster_02](/img/create_cluster_02.png)

1. Click **Next: Create Collection** to proceed. In this step, you can create your first collection in the cluster.

1. In the **Create Collection for Your New Cluster** step, you have to choose **New Collection** to follow this guide.
    ![create_cluster_03](/img/create_cluster_03.png)

    Below are the parameter descriptions for creating a new collection:

    |  **Parameter**   |  **Description**                                                                                                                                                                                                                                                                                                                       |
    | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Collection name |  The name of the collection.                                                                                                                                                                                                                                                                                                           |
    |  Dimension       |  The dimension of the vector data in the collection. The default value is 768.                                                                                                                                                                                                                                                         |
    |  Metric Type     |  The metric type measures the similarity between vectors. Valid values:<br/> <br/>  - Euclidean: measures the distance between two vectors in a plane. The smaller the result, the more similar the two vectors.<br/> <br/>  - Inner product: multiplies two vectors. The more positive the result, the more similar the two vectors.<br/>  |
    |  Description     |  The description of the collection. This parameter is optional.                                                                                                                                                                                                                                                                        |

1. Click **Create Collection and Cluster**. After this step, you will be redirected to a dialog box that displays the public endpoint and API key of your cluster. Be sure to take note of these details, as you will need them to access the cluster.

## Create a dedicated cluster{#create-a-dedicated-cluster}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Enter the organization and project in which you want to create a cluster.

1. On the page that appears, click **+ Create Cluster**.
    ![create_cluster_01](/img/create_cluster_01.png)

1. On the **Create New Cluster** page, select the **Standard** or **Enterprise** plan and configure the corresponding parameters instead.

    |  **Parameter**                     |  **Description**                                                                                                                                  |
    | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  **Cluster Name**                  |  The name of the cluster.                                                                                                                         |
    |  **Cluster Username and Password** |  Credentials for access to this cluster.                                                                                                          |
    |  **Cloud Provider & Region**       |  The cluster's location and the cloud provider it is hosted on. At present, our serverless clusters are available on Google Cloud Platform (GCP). |
    |  **CU Type & Size**                |  The compute resource to be allocated to this cluster.                                                                                            |
    |  **Cloud Backup**                  |  Whether to enable cloud backup for the data in this cluster.                                                                                     |

    ![create-dedicated_cluster](/img/create-dedicated_cluster.png)

1. Click **Create Cluster**. After this step, you will be redirected to a dialog box that displays the public endpoint and token for the access to your cluster. Be sure to take note of these details, as you will need them to access the cluster.

## Verification{#verification}

After you create the cluster, you can check its status on the cluster list page. If the cluster enters the **Running** state, the cluster is created.

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster) 

- [Create Collection](./create-collection-2) 

- [Insert Entities](./insert-entities) 

- [Search and Query](./search-query-and-get) 

- [Drop Collection](./drop-collection-1) 

- [Example Dataset](./example-dataset-1) 
