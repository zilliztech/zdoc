---
title: "Implement Multi-tenancy | BYOC"
slug: /multi-tenancy
sidebar_label: "Implement Multi-tenancy"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, multi-tenancy means multiple customers or teams—referred to as tenants— share the same cluster while maintaining isolated data environments. | BYOC"
type: origin
token: R8amwM1K6iBDLuk0KcEcHJxtnhb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - multi-tenancy
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';


# Implement Multi-tenancy

In Zilliz Cloud, multi-tenancy means multiple customers or teams—referred to as **tenants**— share the same cluster while maintaining isolated data environments. 

Zilliz Cloud supports four multi-tenancy strategies, each offering a different trade-off between scalability, data isolation, and flexibility. This guide walks you through each option, helping you choose the most suitable strategy for your use case.

## Multi-tenancy strategies\{#multi-tenancy-strategies}

Zilliz Cloud supports multi-tenancy at four levels: **Database**, **Collection**, **Partition**, and **Partition Key**. 

### Database-level multi-tenancy\{#database-level-multi-tenancy}

With database-level multi-tenancy, each tenant receives a corresponding [database](./database) containing one or more collections. 

![NVV9w0w49hZJ61bNzG4cdi9gn6C](https://zdoc-images.s3.us-west-2.amazonaws.com/NVV9w0w49hZJ61bNzG4cdi9gn6C.png)

- **Scalability**: The database-level multi-tenancy strategy is only available to Zilliz Cloud’s Dedicated clusters and supports a maximum of 1,024 tenants .

- **Data isolation**: The data in each database is fully separated, offering enterprise-grade data isolation ideal for regulated environments or customers with strict compliance needs.

- **Flexibility**: Each database can have collections with different schemas, offering highly flexible data organization and allowing each tenant to have its own data schema.

- **Others**: This strategy also supports RBAC, enabling fine-grained control over user access per tenant. Additionally, you can flexibly load or release data for specific tenants to manage hot and cold data effectively.

### Collection-level multi-tenancy\{#collection-level-multi-tenancy}

With collection-level multi-tenancy, each tenant is assigned a [collection](./manage-collections), offering strong data isolation. 

![SNxNwi64ChMFdubYKmrcGOH5ncg](https://zdoc-images.s3.us-west-2.amazonaws.com/SNxNwi64ChMFdubYKmrcGOH5ncg.png)

- **Scalability**: Since a cluster can hold up to 16,384 collections , this strategy can accommodate the same number of tenants within the cluster.

- **Data isolation**: Collections are physically isolated from one another. This strategy provides strong data isolation.

- **Flexibility**: This strategy allows each collection to have its own schema, accommodating tenants with different data schemas.

- **Others**: This strategy also supports RBAC, allowing for granular access control over tenants. Additionally, you can flexibly load or release data for specific tenants to manage hot and cold data effectively.

### Partition-level multi-tenancy\{#partition-level-multi-tenancy}

In partition-level multi-tenancy, each tenant is assigned to a manually created [partition](./manage-partitions) within a shared collection. 

![D5cawfOk0hKkJmbJwHwc54a5n4f](https://zdoc-images.s3.us-west-2.amazonaws.com/D5cawfOk0hKkJmbJwHwc54a5n4f.png)

- **Scalability**: A collection can hold up to 1,024 partitions per collection, allowing for the same number of tenants within it.

- **Data isolation**: The data of each tenant is physically separated by partitions.

- **Flexibility**: This strategy requires all tenants to share the same data schema. And partitions need to be manually created.

- **Others**: RBAC is not supported on the partition level. Tenants can be queried either individually or across multiple partitions, which makes this approach well-suited for scenarios involving aggregated queries or analytics across tenant segments. Additionally, you can flexibly load or release data for specific tenants to manage hot and cold data effectively.

### Partition key-level multi-tenancy\{#partition-key-level-multi-tenancy}

With this strategy, all tenants share a single collection and schema, but each tenant's data is automatically routed into 16 physically isolated partitions based on the [partition key](./use-partition-key) value. Although each physical partition can contain multiple tenants, the data from different tenants remains logically separated. 

![GzOrwUHnEhaPGybcp7ActPwsnMh](https://zdoc-images.s3.us-west-2.amazonaws.com/GzOrwUHnEhaPGybcp7ActPwsnMh.png)

- **Scalability**: The partition key-level strategy offers the most scalable approach, supporting millions of tenants.

- **Data isolation**: This strategy offers relatively weak data isolation because multiple tenants can share a physical partition.

- **Flexibility**: Since all tenants must share the same data schema, this strategy offers limited data flexibility.

- **Others**: RBAC is not supported on the partition-key level. Tenants can be queried either individually or across multiple partitions, which makes this approach well-suited for scenarios involving aggregated queries or analytics across tenant segments.

## Choosing the right multi-tenancy strategy\{#choosing-the-right-multi-tenancy-strategy}

The table below offers a comprehensive comparison between the four levels of multi-tenancy strategies.

<table>
   <tr>
     <th></th>
     <th><p><strong>Database-level</strong></p></th>
     <th><p><strong>Collection-level</strong></p></th>
     <th><p><strong>Partition-level</strong></p></th>
     <th><p><strong>Partition key-level</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Cluster deployment option</strong></p></td>
     <td><p>Dedicated only</p></td>
     <td><p>All deployment options</p></td>
     <td><p>All deployment options</p></td>
     <td><p>All deployment options</p></td>
   </tr>
   <tr>
     <td><p><strong>Data Isolation</strong></p></td>
     <td><p>Physical</p></td>
     <td><p>Physical</p></td>
     <td><p>Physical</p></td>
     <td><p>Physical + Logical</p></td>
   </tr>
   <tr>
     <td><p><strong>Max. number of tenants</strong></p></td>
     <td><p>1024</p></td>
     <td><p>Up to 16,384 depending on the cluster deployment option and project plan. </p><p>See <a href="./limits#collections">Zilliz Cloud Limits</a></p></td>
     <td><p>Up to 1,024 per collection depending on the cluster deployment option and project plan. </p><p>See <a href="./limits">Zilliz Cloud Limits</a></p></td>
     <td><p>Millions</p></td>
   </tr>
   <tr>
     <td><p><strong>Data schema flexibility</strong></p></td>
     <td><p>High</p></td>
     <td><p>Medium</p></td>
     <td><p>Low</p></td>
     <td><p>Low</p></td>
   </tr>
   <tr>
     <td><p><strong>RBAC support</strong></p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p><strong>Search performance</strong></p></td>
     <td><p>Strong</p></td>
     <td><p>Strong</p></td>
     <td><p>Medium</p></td>
     <td><p>Medium</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-tenant search support</strong></p></td>
     <td><p>No</p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Support for effective handling of hot and cold data</strong></p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>Yes</p></td>
     <td><p>No</p><p>Currently, not supported for the partition key-level strategy. But if you have massive tenants and require effective handling of hot and cold data, please <a href="https://zilliz.com/contact-sales">contact us</a>.</p></td>
   </tr>
</table>

There are several factors to consider when you choose the multi-tenancy strategy in Zilliz Cloud.

1. **Scalability:** Partition Key > Partition > Collection > Database

    If you expect to support a very large number of tenants (millions or more), use the partition key-level strategy.

1. **Strong data isolation requirements**: Database = Collection > Partition > Partition Key

    Choose database, collection, or partition-level strategies if you have strict physical data isolation requirements. 

1. **Flexible data schema for each tenant's data:** Database > Collection > Partition = Partition Key

    Database-level and collection-level strategies provide full flexibility in data schemas. If your tenants' data structures are different, choose database-level or collection-level multi-tenancy.

1. **Others**

    1. **Performance:** Search performance is determined by various factors, including indexes, search parameters, and machine configurations. Zilliz Cloud also support performance-tuning. It is recommended to test the actual performance before you select a multi-tenancy strategy.

    1. **Effective handling of hot and cold data**: Currently, the database-level, collection-level, and partition-level strategies all support hot and cold data handling. For those who want to choose the partition key-level strategy but require hot and cold data handling, please [contact us](https://zilliz.com/contact-sales).

    1. **Cross-tenant searches**: Only the partition-level and partition-key-level strategies support cross-tenant queries.

