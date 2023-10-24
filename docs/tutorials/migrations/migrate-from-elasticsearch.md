---
slug: /migrate-from-elasticsearch
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Migrate from Elasticsearch

This topic offers a step-by-step guide on how to migrate data from Elasticsearch to Zilliz Cloud. By doing so, you can unlock the full potential of business data with enhanced scalability, performance, and ease of use.

## Before you start{#before-you-start}

Make sure the following steps are performed:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have created a **Dedicated** cluster on Zilliz Cloud. For details, see [Create Cluster](./create-cluster) and [Cluster Types Explained](./cluster-types-explained).

- You have created an Elasticsearch cluster running on version 7.x or later. For details, see [Installing Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html).

## Connect to your Elasticsearch cluster{#connect-to-your-elasticsearch-cluster}

To interact with your Elasticsearch cluster on Zilliz Cloud, connect to it first. Depending on deployment modes, Zilliz Cloud provides the following connection methods:

- **Connect via Cloud ID**: applies to an Elasticsearch cluster that runs on Elastic Cloud. If this is the case, specify the cloud ID and API key of the Elasticsearch cluster.

- **Connect via URL**: applies to an Elasticsearch cluster that runs on premises. If this is the case, specify the cluster URL and a pair of username and password.

For information on how to obtain the connection details of your Elasticsearch cluster, see [Connect to your cluster](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect) and [Get API key information](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html).

![connect_to_es](/img/connect_to_es.png)

## Migrate an Elasticsearch index to a Zilliz Cloud collection{#migrate-an-elasticsearch-index-to-a-zilliz-cloud-collection}

In Zilliz Cloud, a collection is similar to an index in Elasticsearch. To migrate data from an Elasticsearch index to a Zilliz Cloud collection, first connect to an Elasticsearch cluster, and then choose a source index and specific fields from the left frame. The selected items will appear in the Zilliz Cloud collection on the right frame.

![migrate_index](/img/migrate_index.png)

By default, the collection follows the naming convention **Collection_n**, where *n* represents a numerical value assigned to distinguish it from other collections on Zilliz Cloud.

For each migration, you can select only one `dense_vector` field and one or more other fields in the source index. When selecting the fields to migrate, note that:

- The vector field `dense_vector` in an Elasticsearch index is mapped to `FloatVector` in a Zilliz Cloud collection. As a supplement, you can determine the metric type that applies to the `FloatVector` field. Available values are **Euclidean (L2)** and **Inner Product (IP)**.

- The dimension of vector data is determined by that in the source index. If your Zilliz Cloud cluster is of the capacity- or cost-optimized CU type, make sure the dimension of the `dense_vector` field you select to migrate is no less than 32. Otherwise, an error will occur and the data cannot be migrated. For more information, see [CU Types Explained](./cu-types).

:::info Notes

For more information on field mappings, see [Field mappings](./migrate-from-elasticsearch#field-mappings).

:::

In the **Primary Key** section, select a field as the primary key for the collection. You can select the metadata field `_id` or any other field from the source Elasticsearch index as the primary key. If you use `_id`, set its data type to either **Int64** or **VarChar**.

In the **Dynamic Schema** section, determine whether to enable a dynamic schema for the collection. For more information, see [Enable Dynamic Schema](./enable-dynamic-schema).

## Verify the migration results{#verify-the-migration-results}

After the status of the migration job changes from **MIGRATING** to **SUCCESSFUL**, the migration process ends.

:::info Notes

During the migration process, you can insert data into the source index in Elasticsearch. However, the newly inserted data may not be migrated in a synchronous manner.

:::

![verify_collection_es](/img/verify_collection_es.png)

## Field mappings{#field-mappings}

The table below provides details on how fields in an Elasticsearch index are mapped to fields in a Zilliz Cloud collection.

|  **Field Type in Elasticsearch** |  **Field Type in Zilliz Cloud** |  **Description**                                                                                                                                              |
| -------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  dense_vector                    |  FloatVector                    |  The dimension of vectors remains the same as that in the source index. You can specify a metric type between **L2** and **IP**.                              |
|  keyword                         |  VarChar                        |  Specify the maximum data length with a valid value for Max Length between 1 to 65,535. If any string exceeds the limit, an error can occur during migration. |
|  text                            |  VarChar                        |  Specify the maximum data length with a valid value for Max Length between 1 to 65,535. If any string exceeds the limit, an error can occur during migration. |
|  long                            |  Int64                          |  -                                                                                                                                                            |
|  integer                         |  Int32                          |  -                                                                                                                                                            |
|  double                          |  Double                         |  -                                                                                                                                                            |
|  float                           |  Float                          |  -                                                                                                                                                            |
|  boolean                         |  Bool                           |  -                                                                                                                                                            |

## Related topics{#related-topics}

- [Search and Query](./search-query-and-get)

- [Insert Entities](./insert-entities)

- [AUTOINDEX Explained](./autoindex-explained)

- [CU Types Explained](./cu-types)
