---
slug: /cluster-types-explained
beta: FALSE
notebook: FALSE
sidebar_position: 3
---



# Cluster Types Explained

There are two types of clusters on Zilliz Cloud: serverless clusters and dedicated clusters. A serverless cluster provides the simplest way to experience fully-managed vector database clusters, whereas a dedicated cluster enables a full set of features and high availability and security.

This topic provides details on these cluster types to aid in cluster selection.

:::info Notes

The capabilities described in this topic are for planning purposes only and do not guarantee actual performance. The performance of each cluster varies based on its specific configuration.

:::

## Serverless cluster{#serverless-cluster}

On Zilliz Cloud, a serverless cluster indicates that the compute resources are provisioned dynamically on-demand, and the user who has created the cluster shares the resources with other serverless cluster users. This type of cluster eliminates the need to provision and manage [compute unit (CU)](./cu-types) resources, as Zilliz Cloud takes care of the underlying infrastructure.

When creating a serverless cluster, you won't need to pay any fees, as Zilliz Cloud offers the **Starter** tier that allows each user to create one serverless cluster free of charge. This option is tailored for users who are new to vector databases and want to quickly get started.

### Limits per serverless cluster{#limits-per-serverless-cluster}

Before choosing a serverless cluster, note that there are some limits.

Currently, Zilliz Cloud hosts all serverless clusters on Google Cloud Platform (GCP), and each user can create no more than one serverless cluster. If you want to create two or more clusters or run clusters on cloud providers other than GCP, dedicated clusters can better suit your needs.

Regarding usage quotas, each serverless cluster can contain a maximum of two [collections](./cluster-collection-and-entities), each of which is created in simplified mode. This means that you can configure basic parameters for collections in serverless clusters, including the collection name, vector dimension, and metric type. Advanced options are available only for dedicated clusters.

In a serverless cluster, each collection can hold approximately 500,000 768-dimensional vectors. If you want to quickly get started with a vector database cluster or swiftly build your AI application, we recommend choosing this cluster type.

For more information, see [Free Trials](./free-trials).

## Dedicated cluster{#dedicated-cluster}

A dedicated cluster is a cluster whose CUs are dedicated to a particular application or set of applications, which enables the cluster to operate at optimal performance.

This type of cluster is often used in enterprise environments where there are strict requirements for performance, availability, and security. By dedicating CUs to a single cluster, teams or organizations can make sure the cluster is able to meet its performance requirements without being affected by other workloads.

In addition to performance benefits, dedicated clusters also offer greater control over the cluster configuration. When creating a dedicated cluster, you need to determine the CUs that will be provisioned for the cluster and customize the cluster specification, including where to host the cluster, whether to enable backup for disaster recovery, what type of CU is used, and how many CUs are required to process your vector data.

When creating a dedicated cluster, keep in mind that this type of cluster is charged on demand. This means that you pay only for the resources you subscribe to. That being said, it's important to carefully consider your cluster configuration and resource needs when creating a dedicated cluster to ensure that you're optimizing your spend while also meeting your performance, availability, and security requirements. For more information on how Zilliz Cloud charges, see [Pricing Calculator](https://www.notion.so/Pricing-Calculator-4102f43b442c42d6b3fc4da208ee63b0?pvs=21).

Regarding security, dedicated clusters secure data by enabling private access. One option available to users is to set up a private link, which can be used to privately access a dedicated cluster. This can provide users with additional security and control over their cluster.

For more information, see [Free Trials](./free-trials).

## Comparison{#comparison}

The following table compares serverless clusters and dedicated clusters.

|  **Item**                   |  **Serverless Cluster** |  **Dedicated Cluster**                                                                    |
| --------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
|  Pricing                    |  Free                   |  Charged on demand. For more information, see [Pricing Calculator](./pricing-calculator). |
|  Cloud provider & region    |  GCP only               |  AWS and GCP                                                                              |
|  CU Type / Size             |  Default                |  On demand                                                                                |
|  Authentication             |  API key                |  Username and password                                                                    |
|  Private access             |  Not supported          |  Supported                                                                                |
|  Cloud backup               |  Not supported          |  Supported                                                                                |
|  Max. number of collections |  2                      |  On demand                                                                                |
|  Migration                  |  Not supported          |  Supported                                                                                |

