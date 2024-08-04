---
title: "Migrate from Elasticsearch | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Migrate from Elasticsearch"
beta: FALSE
notebook: FALSE
description: "This topic offers a step-by-step guide on how to migrate data from Elasticsearch to Zilliz Cloud. By doing so, you can unlock the full potential of business data with enhanced scalability, performance, and ease of use. | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch

---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch

This topic offers a step-by-step guide on how to migrate data from Elasticsearch to Zilliz Cloud. By doing so, you can unlock the full potential of business data with enhanced scalability, performance, and ease of use.

## Before you start{#before-you-start}

Make sure the following steps are performed:

- You have registered an account with Zilliz Cloud. For details, see [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have created a **Dedicated** cluster on Zilliz Cloud. For details, see [Create Cluster](./create-cluster)  and [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

- You have created an Elasticsearch cluster running on version 7.x or later. For details, see [Installing Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/install-elasticsearch.html).

## Connect to your Elasticsearch cluster{#connect-to-your-elasticsearch-cluster}

To interact with your Elasticsearch cluster on Zilliz Cloud, establish a connection using either of the methods based on your deployment:

- **Connect via Cloud ID**: applies to an Elasticsearch cluster that runs on Elastic Cloud. If this is the case, specify the cloud ID and API key of the Elasticsearch cluster.

- **Connect via URL**: applies to an Elasticsearch cluster that runs on premises. If this is the case, specify the cluster URL and a username and password credential.

[Connect to your cluster](https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect) and [Get API key information](https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html) can guide you on obtaining the required information.

![connect_to_es](/img/connect_to_es.png)

## Transition from Elasticsearch index to Zilliz Cloud collection{#transition-from-elasticsearch-index-to-zilliz-cloud-collection}

In Zilliz Cloud, collections are analogous to Elasticsearch indexes. To migrate:

1. Connect to your Elasticsearch cluster.

1. Select a source index and desired fields from the left frame; they will appear in the Zilliz Cloud collection on the right frame.

![migrate_index](/img/migrate_index.png)

New collections are named `Collection_n` by default, where `n` is a unique numerical identifier.

During migration, select:

- One `dense_vector` field. If no vector field is selected, data migration will fail.

- Multiple other fields from the source index. Make sure the index fields you select to migrate have not been excluded in Elasticsearch. Otherwise, data migration will fail. For more information, refer to [Elasticsearch documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-source-field.html#include-exclude).

Considerations:

- Elasticsearch's `dense_vector` field maps to `FloatVector` in Zilliz Cloud. Choose either **Euclidean (L2)** or **Inner Product (IP)** as the metric type for the `FloatVector` field.

- The vector data dimension is retained from the source index. Ensure the `dense_vector` field dimension is at least 32 for capacity-optimized CU type clusters to prevent migration errors. See [Select the Right CU](./cu-types-explained) for details.

- See [Field mapping reference](./migrate-from-elasticsearch#field-mapping-reference) for details on field mappings.

In the **Primary Key** section, select a field as the primary key for the collection. You can select the metadata field `_id` or any other field from the source Elasticsearch index as the primary key. If you use `_id`, set its data type to either **Int64** or **VarChar**.

In the **Dynamic Schema** section, decide if you want to enable dynamic schema for the collection. For more information, see [Enable Dynamic Field](./enable-dynamic-field).

## Verify the migration results{#verify-the-migration-results}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>Data inserted into the Elasticsearch source index during migration may not synchronously migrate.</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## Field mapping reference{#field-mapping-reference}

Review the table below to understand how Elasticsearch field types map to Zilliz Cloud field types.

<table>
   <tr>
     <th><p><strong>Elasticsearch Field Type</strong></p></th>
     <th><p><strong>Zilliz Cloud Field Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>dense_vector</p></td>
     <td><p>FloatVector</p></td>
     <td><p>Vector dimensions remain unchanged. Specify <strong>L2</strong> or <strong>IP</strong> as the metric type.</p></td>
   </tr>
   <tr>
     <td><p>keyword</p></td>
     <td><p>VarChar</p></td>
     <td><p>Set Max Length (1 to 65,535). Strings exceeding the limit can trigger migration errors.</p></td>
   </tr>
   <tr>
     <td><p>text</p></td>
     <td><p>VarChar</p></td>
     <td><p>Set Max Length (1 to 65,535). Strings exceeding the limit can trigger migration errors.</p></td>
   </tr>
   <tr>
     <td><p>long</p></td>
     <td><p>Int64</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>integer</p></td>
     <td><p>Int32</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>double</p></td>
     <td><p>Double</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>float</p></td>
     <td><p>Float</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>boolean</p></td>
     <td><p>Bool</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>object</p></td>
     <td><p>JSON</p></td>
     <td><p>-</p></td>
   </tr>
</table>

## Related topics{#related-topics}

- [Search, Query & Get](./search-query-get)

- [Insert, Upsert & Delete](./insert-update-delete)

- [AUTOINDEX Explained](./autoindex-explained)

