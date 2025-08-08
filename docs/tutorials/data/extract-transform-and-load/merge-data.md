---
title: "Merge Data | Cloud"
slug: /merge-data
sidebar_label: "Merge Data"
beta: PRIVATE
notebook: FALSE
description: "You can merge data from an existing Zilliz Cloud collection and that from a local file or an external object storage to create a collection that combines the data from both sources. This is referred to as a data merging operation, and you can use it as a workaround to add fields with data to an existing collection. | Cloud"
type: origin
token: Q2qwwliDki25vRkZrYxc7Rnnn4e
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - cloud
  - ETL
  - extract
  - transform
  - load
  - data merging
  - merge data
  - Knowledge base
  - natural language processing
  - AI chatbots
  - cosine distance

---

import Admonition from '@theme/Admonition';


# Merge Data

You can merge data from an existing Zilliz Cloud collection and that from a local file or an external object storage to create a collection that combines the data from both sources. This is referred to as a data merging operation, and you can use it as a workaround to add fields with data to an existing collection.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>This feature is currently in <strong>PRIVATE PREVIEW</strong>. If you are interested in this feature and want to have a try, please do not hesitate to contact <a href="https://support.zilliz.com/hc/en-us">Zilliz Cloud support</a>.</li>
</ul>

</Admonition>

## Overview{#overview}

You can use Zilliz Cloud stages as an intermediate storage location to hold data uploaded from local files, and merge the uploaded data with that from an existing collection to create a combined collection that incorporates data from both sources.

The data uploaded from local files should be a **Parquet** file containing column-wise data for the fields to be appended. In the diagram below, the **Parquet** file should contain the data for the `date` field, with each row consisting of a 10-character string.

![Gfduwu9hGh8CGkbcJ1JccREunRf](/img/Gfduwu9hGh8CGkbcJ1JccREunRf.png)

You can use the prepared **Parquet** file stored in an external object storage as the source data for the data merging operation. If this is the case, you may need to provide the access credentials for Zilliz Cloud to access your S3-compatible object storage bucket.

## Use stage{#use-stage}

To perform a data merging operation using a stage, you first create a stage and upload the data from the local file system into it. Once that is done, you can perform a data merge operation to create a new collection that combines the data from both the existing collection and the external storage.

The following code snippet demonstrates how to use a stage to perform the data merging operation. For details on how to create a stage and upload data to it, refer to [Manage Stages](./manage-stages).

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/etl/merge" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "in00-xxxxxxxxxxxxxxx",
    "dbName": "my_database",
    "collectionName": "my_collection",
    "destDbName": "my_database",
    "destCollectionName": "my_merged_collection",
    "dataSource": {
        "type": "stage",
        "stageName": "my_stage",
        "dataPath": "/path/to/your/parquet.parquet"
    },
    "mergeField": "id",
    "newFields": [
        {
            "name": "date",
            "dataType": "VARCHAR",
            "params": {
                "maxLength": 10
            }
        }
    ]
}'
```

Before running the above command, there are several fields that you may need to pay attention to:

- `dbName` and `collectionName`

    These two parameters determine the source collection of the data merging operation.

- `destDbName` and `destCollectionName`

    These two parameters determine the target collection that will be generated after the data merging operation.

- `dataSource`

    This parameter includes the data source settings, such as the data source type and the path to the Parquet file that contains column-wise data, which will be merged with data from the source collection and stored in the target collection.

    When using a stage as the intermediate storage spot, you need to set `stageName` and `dataPath` after setting `type` to `stage`.

- `mergeField`

    The data merging operation is similar to a LEFT JOIN operation in relational database systems, with the merge field serving as the shared key between the source collection and the Parquet file containing column-wise data.

- `newFields`

    This is a list of schemas for the fields to add to the target collection after the data merging operation, ensuring data from the Parquet file is stored.

The above command creates a data merging job and returns its ID. 

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

## Use object storage{#use-object-storage}

To perform a data merging operation using an object storage bucket, you first create an object storage bucket and upload the data to it. Once that is done, you can perform a data merge operation to create a new collection that combines the data from both the existing collection and the external storage.

The following code snippet demonstrates how to use an object storage bucket to perform a data merging operation. You can refer to the documents of your block storage service provider to learn how to create a bucket and upload data to it.

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/etl/merge" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "clusterId": "in00-xxxxxxxxxxxxxxx",
    "dbName": "my_database",
    "collectionName": "my_collection",
    "destDbName": "my_database",
    "destCollectionName": "my_merged_collection",
    "dataSource": {
        "type": "s3",
        "dataPath": "s3://my_bucket/path/to/your/parquet.parquet",
        "credential": {
            "accessKey": "xxxx",
            "secretKey": "xxxx"
        }
    },
    "mergeField": "id",
    "newFields": [
        {
            "name": "date",
            "dataType": "VARCHAR",
            "params": {
                "maxLength": 10
            }
        }
    ]
}'
```

Before running the above command, there are several fields that you may need to pay attention to:

- `dbName` and `collectionName`

    These two parameters determine the source collection of the data merging operation.

- `destDbName` and `destCollectionName`

    These two parameters determine the target collection that will be generated after the data merging operation.

- `dataSource`

    This parameter includes the data source settings, such as the data source type and the path to the Parquet file that contains column-wise data, which will be merged with data from the source collection and stored in the target collection.

    When using an S3-compatible object storage bucket as the intermediate storage spot, you need to set `dataPath` and `credential` after setting `type` to `s3`.

- `mergeField`

    The data merging operation is similar to a LEFT JOIN operation in relational database systems, with the merge field serving as the shared key between the source collection and the Parquet file containing column-wise data.

- `newFields`

    This is a list of schemas for the fields to add to the target collection after the data merging operation, ensuring data from the Parquet file is stored.

The above command creates a data merging job and returns its ID. 

```json
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

## Verify the results{#verify-the-results}

Once you obtain the ID of the data merging job, you can use the [Describe Job](/reference/restful/describe-job-v2) or the steps listed in Manage Project Jobs to check its status in detail.

## Troubleshooting{#troubleshooting}

1. **How can I handle the situation where the rows in the Parquet file have merge keys that do not match any entities in the source collection?**

    Similar to a left join operation in relational database systems, the data merging operation combines all rows from the source collection with matching rows from the specified Parquet file. This results in a new destination collection containing all fields from the source, the fields defined in newFields, and the combined data. 

    Only rows from the Parquet file with a merge key matching those in the source collection will be merged. Rows are skipped if their merge keys do not match any entity in the source collection. If none of the rows in the Parquet file match any entity, only the fields specified in `newFields` will be created optionally with their default values, if configured.