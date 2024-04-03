---
slug: /migrate-from-elasticsearch
beta: FALSE
notebook: FALSE
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch

This topic offers a step-by-step guide on how to migrate data from Elasticsearch to Zilliz Cloud. By doing so, you can unlock the full potential of business data with enhanced scalability, performance, and ease of use.

## Before you start{#before-you-start}

Make sure the following steps are performed:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have created a __Dedicated__ cluster on Zilliz Cloud. For details, see [Create Cluster](./create-cluster)  and [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

- You have created an Elasticsearch cluster running on version 7.x or later. For details, see [Installing Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html).

## Connect to your Elasticsearch cluster{#connect-to-your-elasticsearch-cluster}

To interact with your Elasticsearch cluster on Zilliz Cloud, establish a connection using either of the methods based on your deployment:

- __Connect via Cloud ID__: applies to an Elasticsearch cluster that runs on Elastic Cloud. If this is the case, specify the cloud ID and API key of the Elasticsearch cluster.

- __Connect via URL__: applies to an Elasticsearch cluster that runs on premises. If this is the case, specify the cluster URL and a username and password credential.

[Connect to your cluster](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect) and [Get API key information](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html) can guide you on obtaining the required information.

![connect_to_es](/img/connect_to_es.png)

## Transition from Elasticsearch index to Zilliz Cloud collection{#transition-from-elasticsearch-index-to-zilliz-cloud-collection}

In Zilliz Cloud, collections are analogous to Elasticsearch indexes. To migrate:

1. Connect to your Elasticsearch cluster.

1. Select a source index and desired fields from the left frame; they will appear in the Zilliz Cloud collection on the right frame.

![migrate_index](/img/migrate_index.png)

New collections are named `Collection_n` by default, where `n` is a unique numerical identifier.

During migration, you can select:

- One `dense_vector` field

- Multiple other fields from the source index

Considerations:

- Elasticsearch's `dense_vector` field maps to `FloatVector` in Zilliz Cloud. Choose either __Euclidean (L2)__ or __Inner Product (IP)__ as the metric type for the `FloatVector` field.

- The vector data dimension is retained from the source index. Ensure the `dense_vector` field dimension is at least 32 for capacity-optimized CU type clusters to prevent migration errors. See [Select the Right CU](./cu-types-explained) for details.

- See [Field mapping reference](./migrate-from-elasticsearch#field-mapping-reference) for details on field mappings.

In the __Primary Key__ section, select a field as the primary key for the collection. You can select the metadata field `_id` or any other field from the source Elasticsearch index as the primary key. If you use `_id`, set its data type to either __Int64__ or __VarChar__.

In the __Dynamic Schema__ section, decide if you want to enable dynamic schema for the collection. For more information, see [Enable Dynamic Field](./enable-dynamic-field).

## Verify the migration results{#verify-the-migration-results}

Once the migration status switches from __MIGRATING__ to __SUCCESSFUL__, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>Data inserted into the Elasticsearch source index during migration may not synchronously migrate.</p>

</Admonition>

![verify_collection_es](/img/verify_collection_es.png)

## Field mapping reference{#field-mapping-reference}

Review the table below to understand how Elasticsearch field types map to Zilliz Cloud field types.

|  __Elasticsearch Field Type__ |  __Zilliz Cloud Field Type__ |  __Description__                                                                         |
| ----------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------- |
|  dense_vector                 |  FloatVector                 |  Vector dimensions remain unchanged. Specify __L2__ or __IP__ as the metric type.        |
|  keyword                      |  VarChar                     |  Set Max Length (1 to 65,535). Strings exceeding the limit can trigger migration errors. |
|  text                         |  VarChar                     |  Set Max Length (1 to 65,535). Strings exceeding the limit can trigger migration errors. |
|  long                         |  Int64                       |  -                                                                                       |
|  integer                      |  Int32                       |  -                                                                                       |
|  double                       |  Double                      |  -                                                                                       |
|  float                        |  Float                       |  -                                                                                       |
|  boolean                      |  Bool                        |  -                                                                                       |

## Related topics{#related-topics}

- [Search, Query & Get](./search-query-get)

- [Insert, Upsert & Delete](./insert-update-delete)

- [AUTOINDEX Explained](./autoindex-explained)

