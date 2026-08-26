---
title: "Vector Similarity Deduplication | Cloud"
slug: /vector-similarity-dedup
sidebar_label: "Vector Similarity Deduplication"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Vector similarity deduplication identifies records with highly similar embeddings and groups them as semantic duplicates. Use this job to reduce semantic redundancy, such as paraphrased text, slightly modified images, or multiple versions of similar content. | Cloud"
type: origin
token: Dr1SwNSqriPKTEkeNjDcDE2XnGb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Vector Similarity Deduplication

Vector similarity deduplication identifies records with highly similar embeddings and groups them as semantic duplicates. Use this job to reduce semantic redundancy, such as paraphrased text, slightly modified images, or multiple versions of similar content.

[Primary-key deduplication](./primary-key-dedup) and vector similarity deduplication address different types of duplication. In a data-cleaning workflow, you can first remove records with duplicate primary keys and then run vector similarity deduplication on the remaining data.

## Overview\{#overview}

The following diagram shows how vector similarity deduplication identifies duplicate groups and produces the output dataset. It first partitions the vectors into K-Means clusters and compares records within each cluster using the configured metric. Records that meet the configured similarity or distance threshold are connected and merged into duplicate groups.

![AC9XwS0lVhbb80bYSmscw2LhnZb](https://zdoc-images.s3.us-west-2.amazonaws.com/AC9XwS0lVhbb80bYSmscw2LhnZb.png)

For each duplicate group, one record is selected as the representative. By default, the record closest to the K-Means cluster centroid is selected. You can use `keepBy` to select the representative based on another field instead.

Depending on the output mode, the job either retains all records with duplicate-group metadata or produces a deduplicated dataset containing the representative records and unchanged singleton records.

### Decide what counts as a duplicate\{#decide-what-counts-as-a-duplicate}

The meaning and valid range of the above-mentioned threshold (`similarityThreshold`) depend on the selected metric. You can either set a threshold directly or specify a target deduplication rate. You cannot leave both parameters unspecified.

<table>
   <tr>
     <th><p>Method</p></th>
     <th><p>When to use</p></th>
     <th><p>Behavior</p></th>
   </tr>
   <tr>
     <td><p><code>targetDedupRate</code></p></td>
     <td><p>You do not yet know a suitable threshold.</p></td>
     <td><p>Derives a <code>similarityThreshold</code> from the input data to approach the requested deduplication rate.</p></td>
   </tr>
   <tr>
     <td><p><code>similarityThreshold</code></p></td>
     <td><p>You have already validated a threshold for similar data.</p></td>
     <td><p>Uses the specified cutoff directly.</p><ul><li><p>For <code>cosine</code>, it is a similarity value in <code>(0, 1]</code>.</p></li><li><p>For <code>l2</code>, it is a distance value greater than <code>0</code>.</p></li></ul></td>
   </tr>
</table>

When you specify `targetDedupRate`, the job automatically estimates a `similarityThreshold` that is expected to produce approximately the requested deduplication rate. After K-Means clustering, the job evaluates multiple candidate thresholds against a sample of approximately 10% of the input data, measures the deduplication rate for each threshold, and uses linear interpolation to estimate the threshold corresponding to the requested rate.

This removes the need to determine a suitable `similarityThreshold` manually, but adds an extra parameter-estimation stage before deduplication begins. Expect this stage to add approximately 10% to the processing time compared with using a fixed `similarityThreshold`.

The meaning of `similarityThreshold` depends on the selected metric:

- For `cosine`, it is a similarity value in `(0, 1]`.

- For `l2`, it is a distance value greater than `0`.

### Choose which record to keep\{#choose-which-record-to-keep}

By default, the job selects the record whose vector is closest to the centroid of its K-Means cluster as the representative of each duplicate group.

Use the default behavior when the record closest to the cluster centroid is also the record you want to retain. If duplicate records contain different business values, use `keepBy` to define which record to keep. Set `keepBy` in the format `<field-name>:<strategy>`. For example, `timestamp:max` retains the record with the largest value in the `timestamp` field, which typically represents the most recent record.

```plaintext
| primary key | timestamp  | content         | vector       |
|-------------|------------|-----------------|--------------|
| doc-1       | 1710000000 | Earlier version | [0.12, 0.35] | <!-- Removed with timestamp:max -->
| doc-2       | 1720000000 | Latest version  | [0.18, 0.41] | <!-- Retained with timestamp:max -->
| doc-3       | 1715000000 | Similar version | [0.16, 0.39] | <!-- Removed with timestamp:max -->
```

In this example, the three records are placed in the same duplicate group because their embeddings are sufficiently similar. Without `keepBy`, the job retains the record closest to the K-Means cluster centroid. With `keepBy` set to `timestamp:max`, the job retains `doc-2` because it has the greatest `timestamp` value.

The job retains the complete selected record. It does not combine field values from different records in the duplicate group.

### Choose a distance metric\{#choose-a-distance-metric}

The distance metric determines how vectors are assigned to clusters.

| **Metric** | **How similarity is interpreted** | **When to use** |
| --- | --- | --- |
| `l2` | Vectors with a smaller Euclidean distance are more similar. | Use this metric when your embedding model or existing workflow uses Euclidean distance. |
| `cosine` | Vectors with a larger cosine similarity are more similar. | Use this metric when vector direction is more important than vector magnitude. |

### Choose an output mode\{#choose-an-output-mode}

Choose an output mode based on whether you want to inspect the deduplication results or produce a cleaned dataset directly.

| Mode | What is returned | When to use |
| --- | --- | --- |
| `map` | Retains all input records and adds `parent_id` and `is_representative` to show each record’s duplicate-group assignment and representative status. | Use this mode to inspect duplicate groups, audit the results, or evaluate a new `targetDedupRate` or `similarityThreshold`. |
| `deduped_rows` | Returns the representative record from each duplicate group and preserves singleton records unchanged. | Use this mode after validating the deduplication settings to produce a cleaned dataset for downstream use. |

When `outputMode` is omitted, its default value depends on whether `primaryKeyField` is specified:

- If `primaryKeyField` is specified, `outputMode` defaults to `map`.

- If `primaryKeyField` is omitted, `outputMode` defaults to `deduped_rows`.

To explicitly set the output mode to `map`, you must also specify `primaryKeyField`. Otherwise, the request returns a parameter error.

In `map` mode, the output includes the following additional fields:

| Field | Description |
| --- | --- |
| `parent_id` | The primary key of the selected representative record. Records in the same duplicate group share the same `parent_id`. For a singleton record, `parent_id` is set to its own primary key. |
| `is_representative` | Indicates whether the record is retained as the representative. This field is `true` for the selected representative in each duplicate group and for singleton records. |

For an initial run, use `targetDedupRate` with `map` output and inspect the duplicate groups before removing any records. After validating the results, continue using `targetDedupRate` or set a fixed `similarityThreshold` for repeatable runs.

## Before you start\{#before-you-start}

Before creating a vector similarity deduplication job, ensure that:

- All input files use compatible schemas and contain the vector field to compare.

- All vectors in that field use the same type and dimension and were generated using the same embedding model and preprocessing method.

- To use `map` mode, the input must contain a valid primary-key field, and you must specify it using `primaryKeyField`.

- If you use `keepBy`, the specified field exists in every input file and contains values that can be compared using the selected strategy.

For the general requirements for running Spark batch jobs, including authentication, input files, and output behavior, see [Spark Batch Jobs](./spark-batch-jobs).

## Create a vector similarity deduplication job\{#create-a-vector-similarity-deduplication-job}

Create a vector similarity deduplication job by specifying the input and output locations, the vector field to compare, the duplicate-detection method, how the representative record should be selected, and the output mode. The job runs asynchronously and returns a job ID that you can use to monitor its status. After the job succeeds, the results are available at the configured output path.

<Procedures>

1. Prepare an idempotency key.

    An idempotency key is a unique string that remains unchanged when retrying the same job request. For details, refer to [Idempotent submission](./spark-batch-jobs#idempotent-submission).

1. Prepare the request payload.

    ```bash
    export payload = '{
      "description": "deduplicate by product semantics",
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
        "path": "output/products-vector-dedup.parquet",
        "format": "parquet"
      },
      "primaryKeyField": "id",
      "vectorField": "embedding",
      "metric": "cosine",
      "similarityThreshold": 0.95,
      "outputMode": "map",
      "keepBy": "updated_at:max",
      "resourceSize": "MEDIUM",
      "timeoutSeconds": 7200
    }
    '
    ```

    The following table lists the job-specific parameters:

    <table>
       <tr>
         <th><p>Parameter</p></th>
         <th><p>Required</p></th>
         <th><p>Description</p></th>
       </tr>
       <tr>
         <td><p><code>primaryKeyField</code></p></td>
         <td><p>No</p></td>
         <td><p>The field used as the record identifier. It is also used to generate <code>parent_id</code> values in <code>map</code> output.</p></td>
       </tr>
       <tr>
         <td><p><code>vectorField</code></p></td>
         <td><p>Yes</p></td>
         <td><p>The vector field used for similarity comparison. Supported values include <code>array&lt;float&gt;</code>, numeric arrays, Spark vectors, and comma-separated strings.</p></td>
       </tr>
       <tr>
         <td><p><code>metric</code></p></td>
         <td><p>Yes</p></td>
         <td><p>The metric used for vector comparison. Possible values are <code>cosine</code> and <code>l2</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>similarityThreshold</code></p></td>
         <td><p>No</p></td>
         <td><p>The cutoff used to identify near-duplicate records.</p><ul><li><p>For <code>cosine</code>, specify a similarity value in <code>(0, 1]</code>; records with similarity at or above this value are treated as near-duplicates.</p></li><li><p>For <code>l2</code>, specify a distance greater than <code>0</code>; records with distance at or below this value are treated as near-duplicates.</p></li></ul><p>Do not specify this parameter together with <code>targetDedupRate</code>. If neither parameter is specified, the job uses its built-in duplicate-detection defaults.</p></td>
       </tr>
       <tr>
         <td><p><code>outputMode</code></p></td>
         <td><p>No</p></td>
         <td><p>The output mode. Possible values are <code>map</code> and <code>deduped_rows</code>. If omitted, this parameter defaults to <code>map</code> when <code>primaryKeyField</code> is specified and to <code>deduped_rows</code> otherwise. Setting it to <code>map</code> requires <code>primaryKeyField</code>.</p></td>
       </tr>
       <tr>
         <td><p><code>targetDedupRate</code></p></td>
         <td><p>No</p></td>
         <td><p>The target proportion of records to identify as duplicates. The valid range is <code>(0, 1)</code>. The job derives a threshold from the input data to approach this rate.</p><p>Do not specify this parameter together with <code>similarityThreshold</code>. If neither parameter is specified, the job uses the built-in duplicate-detection defaults for the selected metric.</p></td>
       </tr>
       <tr>
         <td><p><code>keepBy</code></p></td>
         <td><p>No</p></td>
         <td><p>The rule used to select the representative from each duplicate group. Use the format <code>&lt;field-name&gt;:&lt;strategy&gt;</code>, where <code>strategy</code> is <code>max</code> or <code>min</code>. For example, <code>timestamp:max</code> retains the record with the greatest <code>timestamp</code> value. If omitted, the record closest to the K-Means cluster centroid is selected.</p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="Notes">

    `similarityThreshold` and `targetDedupRate` are mutually exclusive. Specifying both or leaving both unspecified results in an error.

    </Admonition>

    For parameters shared by all Spark batch jobs, refer to [Request payload](./spark-batch-jobs#request-payload).

1. Submit the job.

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/projects/{projectId}/jobs/dedup/vector" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-002" \
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
        "description": "deduplicate by product semantics",
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

- The output files exist at the configured Volume path.

- For `map` output:

    - All input records are retained.

    - Records in the same duplicate group share the same `parent_id`.

    - Each duplicate group has exactly one record with `is_representative` set to `true`.

    - Singleton records use their own primary key as `parent_id` and have `is_representative` set to `true`.

- For `deduped_rows` output:

    - Only the representative record from each duplicate group is retained.

    - Singleton records remain unchanged.

- If `keepBy` was specified, the representative in each sampled duplicate group matches the configured field and strategy.

- A sample of the generated duplicate groups contains records that are actually near-duplicates.

## Next step\{#next-step}

If you have not already done so, use [Primary-Key Deduplication](./primary-key-dedup) to identify records with the same primary-key value. For model-training or large-scale data analysis, use [K-Means Clustering](./k-means-clustering) to examine the embedding distribution and [Anomaly Detection](./anomaly-detection) to find unusual records that may need further review. 

