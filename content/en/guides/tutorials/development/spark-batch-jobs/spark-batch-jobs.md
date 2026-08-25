---
title: "Spark Batch Jobs | Cloud"
slug: /spark-batch-jobs
sidebar_label: "Spark Batch Jobs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Spark batch jobs let you run distributed, offline processing on large datasets managed in Zilliz Cloud. Use built-in jobs to deduplicate, cluster, or inspect vector data. | Cloud"
type: origin
token: K4F3wDpFciHWwJkZd5qc302OnWg
sidebar_position: 13
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Spark Batch Jobs

Spark batch jobs let you run distributed, offline processing on large datasets managed in Zilliz Cloud. Use built-in jobs to deduplicate, cluster, or inspect vector data.

Spark batch jobs are designed for long-running data processing tasks. They are not intended for low-latency online requests or per-record transformations.

## Problems you may encounter\{#problems-you-may-encounter}

As vector datasets grow, you may need more than simple insert or search operations. Repeated ingestion can introduce duplicates, large embedding collections can become difficult to understand, and failed preprocessing pipelines can leave behind questionable records.

### Duplicate vector embeddings\{#duplicate-vector-embeddings}

Retries, repeated imports, overlapping data sources, and slightly modified versions of the same text or image can all create duplicate vector embeddings across entities. Some entities share the same primary key, while others have different primary keys but nearly identical content, increasing storage, indexing, and downstream processing costs.

Spark batch jobs can identify and remove duplicates across large datasets. Use **a primary-key deduplication job** to clean up records with the same ID, or **a vector-similarity deduplication job** to find records with different IDs but nearly identical content.

### Unclear embedding distributions\{#unclear-embedding-distributions}

As a collection grows, it becomes difficult to understand the overall embedding distribution. You may not know which patterns dominate the dataset, where long-tail data appears, or whether newly imported data differs from existing records.

**A K-Means clustering job** groups similar embeddings into coarse clusters and assigns each record a cluster ID. You can use the results to analyze data distribution, compare data sources, create representative samples, and break similarity-based processing into smaller groups.

### Hidden anomalies in embedding data\{#hidden-anomalies-in-embedding-data}

Embedding pipelines can produce records that look valid but do not match the rest of the dataset. Failed preprocessing, incorrect models, parsing noise, corrupted source content, or unexpected data batches can all create unusual embeddings that are difficult to spot through manual inspection.

**An anomaly detection job** scans the embedding distribution and identifies records that differ significantly from common patterns. You can use the results to find data that may need re-embedding, cleanup, or further review. An anomaly is not necessarily invalid, so flagged records should be reviewed rather than removed automatically.

## Choose a job type\{#choose-a-job-type}

The following table lists the recommended job types for your goals.

| **Your goal** | **Recommended job** |
| --- | --- |
| Remove records that share the same primary key | [Primary-Key Deduplication](./primary-key-dedup) |
| Find records with highly similar vector representations | [Vector Similarity Deduplication](./vector-similarity-dedup) |
| Divide vector data into a predefined number of groups | [K-Means Clustering](./k-means-clustering) |
| Find records that differ significantly from the main data distribution | [Anomaly Detection](./anomaly-detection) |

## How Spark batch jobs work\{#how-spark-batch-jobs-work}

A Spark batch job is a long-running distributed, offline processing job that returns a job ID immediately upon receiving a job creation request. You can use the job ID as a handler to monitor its progress and manage its lifecycle.

### Before you start\{#before-you-start}

To submit a Spark batch job, ensure that:

- You have a valid Zilliz Cloud API key with sufficient permissions.

- Your input data is available in a Zilliz Cloud Volume in a supported format.

    - Supported data file formats are `parquet`, `lance`, `json`, and `csv`.

- The storage role associated with each External Volume has the permissions required for the job:

    - The input External Volume requires read access to the input location.

    - The output External Volume requires read and write access to the output location, including permission to delete temporary or incomplete objects created during job execution.

    - The input and output External Volumes can use different storage roles.

### Configure External Volume permissions\{#configure-external-volume-permissions}

Spark batch jobs read input data from and write results to External Volumes. Before submitting a job, make sure the object storage role associated with each Volume has the permissions required for its intended use.

The input and output Volumes can use different storage roles. Grant each role only the permissions required for the corresponding bucket and prefix.

#### Input Volume\{#input-volume}

The input Volume requires read access to the input data. If the Integration used by the Volume already provides the required read permissions, no additional permissions are needed.

For Amazon S3, the role requires:

- `s3:GetObject` for objects under the input prefix.

- `s3:ListBucket` to list objects under the input prefix.

- `s3:GetBucketLocation` for the bucket.

<details>

<summary>Click here to view the example.</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListInput",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::<bucket>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "<input-prefix>",
            "<input-prefix>/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadInput",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::<bucket>/<input-prefix>/*"
    }
  ]
}
```

</details>

#### Output Volume\{#output-volume}

The output Volume requires permission to write job results. Spark may also delete temporary objects or objects left by failed or canceled writes.

For Amazon S3, the role requires:

- `s3:GetObject`, `s3:ListBucket`, and `s3:GetBucketLocation` to access the output location.

- `s3:PutObject` to write results.

- `s3:DeleteObject` to clean up temporary or incomplete output objects.

Scope `s3:PutObject` and `s3:DeleteObject` to the output prefix rather than the entire bucket.

<details>

<summary>Click here to view the example.</summary>

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListOutput",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": "arn:aws:s3:::<bucket>",
      "Condition": {
        "StringLike": {
          "s3:prefix": [
            "<output-prefix>",
            "<output-prefix>/*"
          ]
        }
      }
    },
    {
      "Sid": "ReadWriteOutput",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::<bucket>/<output-prefix>/*"
    }
  ]
}
```

</details>

### Submit and run a Spark batch job\{#submit-and-run-a-spark-batch-job}

Once you have obtained the API key and uploaded necessary files to a Zilliz Cloud volume, you are all set to submit and run a Spark batch job.

<Procedures>

1. Generate an idempotency key.

    An idempotency key is a unique string that remains unchanged when retrying the same job request. For details, refer to [Idempotent submission](./primary-key-dedup).

1. Prepare the request header.

    Include the idempotency key generated in the previous step in the request header when creating a Spark batch job.

    ```http
    Authorization: Bearer <api-key>
    Idempotency-Key: spark-job-20260730-001
    Content-Type: application/json
    ```

1. Prepare the request payload.

    All Spark batch jobs share a common payload structure, with job-specific parameters that vary with job purposes.

    For the common payload structure, refer to [Request payload](./primary-key-dedup). For job-specific parameters, refer to the following pages:

    - [Primary-Key Deduplication](./primary-key-dedup)

    - [Vector Similarity Deduplication](./vector-similarity-dedup)

    - [K-Means Clustering](./k-means-clustering)

    - [Outlier Detection](./anomaly-detection)

</Procedures>

#### Idempotent submission\{#idempotent-submission}

Use an idempotency key to make job submission safe to retry. Zilliz Cloud checks both the key and the request body to determine whether to return an existing job or reject the request as a conflict. The following table summarizes the matching behavior.

| Case | Behavior |
| --- | --- |
| Same idempotency key and same request body | Returns the previously created Spark batch job without creating a duplicate. |
| Same idempotency key and different request body | Returns a conflict error. |

The idempotency key is scoped to a specific organization, user, region, and project. Zilliz Cloud retains the key for approximately **25 hours**, based on the maximum job timeout window. After the retention window expires, the same key can be reused for a new submission.

#### Request payload\{#request-payload}

All Spark batch jobs share a common payload structure as follows:

```json
{
  "description": "optional description",
  "regionId": "aws-us-west-2",
  "input": {...},
  "output": {...},
  "resourceSize": "SMALL",
  "timeoutSeconds": 3600
}
```

The following table lists the descriptions of these parameters.

| Parameter | Required | Description |
| --- | --- | --- |
| `description` | No | An optional description for the job.<br/>The value is a string of no more than 1,024 characters. |
| `regionId` | Yes | The ID of a Zilliz Cloud region in which the job runs. For supported regions, see [Cloud Providers & Regions](./cloud-providers-and-regions). |
| `input` | No | The input of the job. This is mandatory only for built-in jobs. For details, refer to the table below. |
| `output` | No | The output of the job. This is mandatory for built-in jobs. For details, refer to the table below. |
| `resourceSize` | No | The size of the Spark cluster required for the job. Possible values are `SMALL`, `MEDIUM`, `LARGE`, `XLARGE`, `2XLARGE`, and `3XLARGE`. |
| `timeoutSeconds` | No | The timeout duration in seconds for the current job. The value is a positive integer ranging from `300` to `86400`. |

The `input` and `output` parameters in the above table share a similar structure as follows:

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Required</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>type</code></p></td>
     <td><p>Yes</p></td>
     <td><p>The Spark batch job type. This applies both to <code>input</code> and <code>output</code>. Possible values are:</p><ul><li><code>volume</code></li></ul></td>
   </tr>
   <tr>
     <td><p><code>volumeId</code></p></td>
     <td><p>No</p></td>
     <td><p>The ID of a Zilliz Cloud volume. This is mandatory when you set <code>type</code> to <code>volume</code>. This applies both to <code>input</code> and <code>output</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>path</code></p></td>
     <td><p>No</p></td>
     <td><p>The input/output file paths relative to the root of the specified Zilliz Cloud volume. This is mandatory when you set <code>type</code> to <code>volume</code>. This applies both to <code>input</code> and <code>output</code>.</p><p>For a file at <code>volume://path/to/data.parquet</code>, set <code>path</code> to <code>path/to/data.parquet</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>format</code></p></td>
     <td><p>No</p></td>
     <td><p>The format of the input or output files. This applies both to <code>input</code> and <code>output</code>. This parameter defaults to <code>parquet</code>. Possible values are <code>parquet</code>, <code>lance</code>, <code>json</code>, <code>csv</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>writeMode</code></p></td>
     <td><p>No</p></td>
     <td><p>The write mode of output files. This applies only to <code>output</code>. Possible values are:</p><ul><li><p><code>ERROR_IF_EXIST</code></p><p>This option returns an error if the specified output file already exists. This is the default option.</p></li><li><p><code>OVERWRITE</code></p><p>This option overwrites the specified file.</p></li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

For `input`, `format` determines which Spark data source reader is used. If you omit this parameter, the job uses the Parquet reader by default and processes only the Parquet files under the specified path. Files in other formats, such as JSON or CSV, are ignored.

If the files you want to process are not Parquet, explicitly set `input.format` to the corresponding format. The job does not automatically detect and combine files of different formats.

</Admonition>

#### Submission response\{#submission-response}

The response to job requests that succeed may have different HTTP codes. The following table lists the applicable HTTP codes carried in the response.

| Case | HTTP code | Description |
| --- | --- | --- |
| Creating a job | `201 CREATED` | Indicates that the job is being created.<br/>Creating a job is asynchronous, and you can use the job ID carried in the response to check its progress and manage its lifecycle. |
| Canceling a job | `202 ACCEPTED` | Indicates that the cancellation is accepted and underway.<br/>Canceling a job is asynchronous, and you can use the job ID carried in the response to check its progress. |
| Describing a job | `200 OK` | Indicates the requested response is returned.<br/>This is synchronous, and the response always carries the job status at the time when the request is processed. |

Although the HTTP codes differ, they share the same payload structure as follows:

```json
{
  "code": 0,
  "data": {
    "jobId": "job-xxxxxxxx",
    "projectId": "proj-xxxxxxxx",
    "type": "SPARK",
    "description": "backfill product attributes",
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

The response includes a job ID that you can use to monitor the job. To view job states, retrieve job details, or cancel a running job, see [Understand job states](./manage-spark-batch-jobs#understand-job-states).

When an error occurs, the response is similar to the following:

```json
{
  "code": 10001,
  "message": "projectId is required",
  "details": {
    "errorCode": "INVALID_PARAMETER"
  }
}
```

You can tell the error from `details.errorCode` and the HTTP CODE the error response carries. The following table lists the applicable HTTP CODE with their indications.

| HTTP code | Description |
| --- | --- |
| `400 BAD REQUEST` | Indicates that the parameters carried in the request are incorrect. |
| `403 FORBIDDEN` | Indicates that the API key does not have sufficient permissions or the resources are not available in the specified project. |
| `404 NOT FOUND` | Indicates that the specified resources, such as the job ID, Zilliz Cloud volume, do not exist. |
| `409 CONFLICT` | Indicates that the idempotency key does not match the request payload. |
| `500 INTERNAL SERVER ERROR` | Indicates that the server fails to process the request. |

## Next steps\{#next-steps}

Use the following guides to create the Spark batch job that matches your goal, or to monitor and manage an existing job.

import DocCardList from '@theme/DocCardList';

<DocCardList />