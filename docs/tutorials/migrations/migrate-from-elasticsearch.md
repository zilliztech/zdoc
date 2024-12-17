---
title: "Migrate from Elasticsearch to Zilliz Cloud | Cloud"
slug: /migrate-from-elasticsearch
sidebar_label: "Migrate from Elasticsearch"
beta: FALSE
notebook: FALSE
description: "Elasticsearch is a highly scalable search and analytics engine known for its speed and flexibility in handling large volumes of data. By leveraging Zilliz Cloud's migration capabilities, you can seamlessly transfer data from your Elasticsearch instances to your Zilliz Cloud cluster. | Cloud"
type: origin
token: Y8nwwbi0KiwtVZkMaSQcsPcwnkf
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - elasticsearch

---

import Admonition from '@theme/Admonition';


# Migrate from Elasticsearch to Zilliz Cloud

[Elasticsearch](https://www.elastic.co/elasticsearch) is a highly scalable search and analytics engine known for its speed and flexibility in handling large volumes of data. By leveraging Zilliz Cloud's migration capabilities, you can seamlessly transfer data from your Elasticsearch instances to your Zilliz Cloud cluster.

This migration process involves establishing a connection with your existing Elasticsearch source and replicating its data indices to the corresponding target collections in Zilliz Cloud, preserving both the structure and performance of your original data while enabling advanced vector search functionalities.

## Considerations{#considerations}

- Currently, you can migrate the following Elasticsearch data types: **dense_vector**, **text**, **string**, **keyword**, **ip**, **date**, **timestamp**, **long**, **integer**, **short**, **byte**, **double**, **float**, **boolean**, **object**, **arrays**. If your table has fields with unsupported data types, you can choose not to migrate those fields or submit a [support ticket](https://support.zilliz.com/hc/en-us/requests/new). For information on how Elasticsearch data types are mapped to Zilliz Cloud, refer to [Field mapping reference](./migrate-from-elasticsearch#field-mapping-reference).

- To ensure compatibility, Auto ID will be disabled and cannot be modified for each target collection on Zilliz Cloud.

- For each migration task, you can select only one vector field from each source index.

- Each migration task is limited to a single source Elasticsearch cluster. If you have data in multiple source clusters, you can set up separate migration jobs for each one.

## Before you start{#before-you-start}

Make sure the following prerequisites are met:

- The source Elasticsearch cluster is running version 7.x or later and is accessible from the public internet.

- You have been granted the Organization Owner or Project Admin role. If you do not have the necessary permissions, contact your Zilliz Cloud administrator.

## Migrate from Elasticsearch to Zilliz Cloud{#migrate-from-elasticsearch-to-zilliz-cloud}

You can migrate source data to a Zilliz Cloud cluster of any plan tier, provided its CU size can accommodate the source data.

![migrate_from_es](/img/migrate_from_es.png)

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Go to the target project page and select **Migrations** > **Elasticsearch**.

1. In the **Connect to Data Source** step, select **Via Endpoint** or **Via Cloud ID** as the connection method to interact with the source Elasticsearch cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p><a href="https://www.elastic.co/guide/en/cloud-enterprise/current/ece-connect.html#ece-connect">Connect to your cluster</a> and <a href="https://www.elastic.co/guide/en/elasticsearch/reference/current/security-api-get-api-key.html">Get API key information</a> can guide you on obtaining the required connection information.</p>

    </Admonition>

1. In the **Select Source and Target** step, configure settings for the source Elasticsearch cluster and target Zilliz Cloud cluster. Then, click **Next**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each source index you choose to migrate from Elasticsearch must include a vector field.</p>

    </Admonition>

1. In the **Configure Schema** step,

    1. Verify the data mapping between your Elasticsearch data and the corresponding Zilliz Cloud data types. Zilliz Cloud has a default mechanism for mapping Elasticsearch data types to its own, but you can review and make necessary adjustments. Currently, you can rename fields, but cannot change the underlying data types.

    1. In **Advanced Settings**, configure **Dynamic Field** and **Partition Key**. For more information, refer to [Dynamic Field](./enable-dynamic-field) and [Use Partition Key](./use-partition-key).

    1. In **Target Collection Name** and **Description**, customize the target collection name and description. The collection name must be unique in each cluster. If the name duplicates an existing one, rename the collection.

1. Click **Migrate**.

## Monitor the migration process{#monitor-the-migration-process}

Once you click **Migrate**, a migration job will be generated. You can check the migration progress on the [Jobs](./job-center) page. When the job status switches from **IN PROGRESS** to **SUCCESSFUL**, the migration is complete.

<Admonition type="info" icon="📘" title="Notes">

<p>After migration, verify that the number of collections and entities in the target cluster matches the data source. If discrepancies are found, delete the collections with missing entities and re-migrate them.</p>

</Admonition>

![verify_collection](/img/verify_collection.png)

## Cancel migration job{#cancel-migration-job}

If the migration process encounters any issues, you can take the following steps to troubleshoot and resume the migration:

1. On the [Jobs](./job-center) page, identify the failed migration job and cancel it.

1. Click **View Details** in the **Actions** column to access the error log.

## Field mapping reference{#field-mapping-reference}

Review the table below to understand how Elasticsearch data types map to Zilliz Cloud field types.

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
     <td><p>text, string, keyword, ip, date, timestamp</p></td>
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
     <td><p>short</p></td>
     <td><p>int16</p></td>
     <td><p>-</p></td>
   </tr>
   <tr>
     <td><p>byte</p></td>
     <td><p>int8</p></td>
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
   <tr>
     <td><p>arrays</p></td>
     <td><p>Array</p></td>
     <td><p>-</p></td>
   </tr>
</table>

