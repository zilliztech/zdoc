---
title: "Primary-Key Deduplication | Cloud"
slug: /primary-key-dedup
sidebar_label: "Primary-Key Deduplication"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Primary-key deduplication identifies records that share the same primary key and removes redundant copies from a large dataset. Use this job to clean up duplicates introduced by repeated imports, pipeline retries, migrations, or overlapping data sources. | Cloud"
type: origin
token: Wh2Kw8tn7ivDZOkDy2jcqFU7nje
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Primary-Key Deduplication

Primary-key deduplication identifies records that share the same primary key and removes redundant copies from a large dataset. Use this job to clean up duplicates introduced by repeated imports, pipeline retries, migrations, or overlapping data sources.

## Overview\{#overview}

A primary-key deduplication job groups records that share the same primary-key value and retains one record from each group. By default, the job selects the retained record based on an internal identifier, so the result is not predictable from user-visible field values. When duplicate records contain different field values, use `keepBy` to define which record should be retained.

### How duplicates are identified\{#how-duplicates-are-identified}

When creating the job, specify the scalar field that will serve as the primary key after the cleaned data is imported into the target collection. The job considers records with the same value in this field to be duplicates and places them in the same duplicate group.

Primary-key deduplication only identifies exact primary-key duplicates. Records with different primary-key values are not considered duplicates, even if their scalar fields or vector embeddings are identical or highly similar.

### Which record is retained\{#which-record-is-retained}

By default, the job selects one record from each duplicate group based on an internal identifier. Use the default behavior only when all duplicate records contain the same field values.

If duplicate records contain different values, use `keepBy` to define which record to retain. Set `keepBy` in the format `<field-name>:<strategy>`. For example, `timestamp:max` retains the record with the largest value in the `timestamp` field, which typically represents the most recent record.

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-1       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-2       | 1715000000 | Another record  | [0.27, 0.53] | <!-- Retained -->
```

In this example, the first two records are considered duplicates because they have the same primary-key value. They contain different values in the `timestamp`, `content`, and `vector` fields. Without `keepBy`, the job retains one record based on an internal identifier, and the result is not predictable from these field values. With `keepBy` set to `timestamp:max`, the job retains the second record because it has the greatest `timestamp` value.

The job retains the complete selected record. It does not combine field values from different duplicate records.

### What the job produces\{#what-the-job-produces}

The job produces a deduplicated dataset containing one complete record for each distinct primary-key value. The output can then be imported into a collection using the selected field as its primary key.

## Before you start\{#before-you-start}

Before creating a primary-key deduplication job, ensure that:

- All input files use compatible schemas that match the target collection.

- The selected primary-key field exists in every input file and contains supported string or integer values.

- If duplicate records contain different values, choose an appropriate `keepBy` field and strategy.

For the general requirements for running Spark batch jobs, including authentication, input files, and output behavior, see [Spark Batch Jobs](./spark-batch-jobs).

## Create a primary-key deduplication job\{#create-a-primary-key-deduplication-job}

Create a primary-key deduplication job by specifying the input and output paths in Zilliz Cloud Volumes, the field that will serve as the primary key, and an optional `keepBy` rule. The job runs asynchronously and returns a job ID that you can use to monitor its progress.

<Procedures>

1. Prepare an idempotency key.

    An idempotency key is a unique string that remains unchanged when retrying the same job request. For details, refer to [Idempotent submission](./primary-key-dedup).

1. Prepare the request payload.

    ```bash
    export payload='{
      "description": "deduplicate by product id",
      "regionId": "aws-us-west-2",
      "input": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "input/products.parquet",
        "format": "parquet"
      },
      "output": {
        "type": "volume",
        "volumeName": "product-data",
        "path": "output/products-dedup.parquet",
        "format": "parquet",
        "writeMode": "ERROR_IF_EXISTS"
      },
      "primaryKeyField": "id",
      "keepBy": "updated_at:max",
      "resourceSize": "SMALL",
      "timeoutSeconds": 3600
    }'
    ```

    The following table lists the job-specific parameters:

    | Parameter | Required | Description |
    | --- | --- | --- |
    | `primaryKeyField` | Yes | The name of a scalar field that will serve as the primary key in the target collection after the data cleanup.<br/>The data type of its values should be either string or integer, as required by Zilliz Cloud collections. |
    | `keepBy` | No | The retention strategy that determines which duplicate will be retained. Set the value in the format of `<field-name>:<strategy>`, such as `timestamp:max`. |

    The following strategies are supported:  

    - `max`: Retains the record with the greatest value in the specified field.

    - `min`: Retains the record with the smallest value in the specified field.

    When `keepBy` is omitted, the job selects one record from each duplicate group based on an internal identifier. Use `keepBy` when duplicate records may contain different field values, and you need a predictable retention rule.

    For parameters shared by all Spark batch jobs, refer to [Request payload](./spark-batch-jobs#request-payload).

1. Submit the job.

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/dedup/pk" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-001" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```

    The request returns after the job is created. The response includes a job ID that you can use to monitor its progress. The following example shows a successful response:

    ```json
    {
      "code": 0,
      "data": {
        "jobId": "job-xxxxxxxx",
        "projectId": "proj-xxxxxxxx",
        "type": "SPARK",
        "description": "deduplicate by product id",
        "status": "PENDING",
        "regionId": "aws-us-west-2",
        "clusterId": "in-xxxxxxxx",
        "createdAt": null,
        "startedAt": null,
        "finishedAt": null,
        "durationSeconds": null
      }
    }
    ```

    For details about submission behaviors, refer to [Submission response](./spark-batch-jobs#submission-response).

</Procedures>

## Monitor the job\{#monitor-the-job}

After submitting the request, use the returned job ID to monitor the job until it reaches a terminal state. You can view the job status and details, list existing jobs, or cancel the job while it is still in a cancelable state.

When the job succeeds, verify that the expected output is available at the path specified in the request.

For instructions, job states, and state transitions, see [Manage Spark Batch Jobs](./manage-spark-batch-jobs).

## Validate the output\{#validate-the-output}

After the job succeeds, verify that:

- The output files are available at the configured Volume path.

- Each primary-key value appears only once.

- The expected records were retained based on the configured `keepBy` rule.

You may also compare the input and output record counts to confirm that the number of removed duplicates is reasonable.

## Next step\{#next-step}

Primary-key deduplication removes records that share the same primary-key value, but additional cleanup may be useful depending on your dataset. Use [Vector Similarity Deduplication](./vector-similarity-dedup) to identify records with different primary keys but highly similar content. For model-training or large-scale data analysis, use [K-Means Clustering](./k-means-clustering) to examine the embedding distribution and [Outlier Detection](./anomaly-detection) to find unusual records that may need further review. 

