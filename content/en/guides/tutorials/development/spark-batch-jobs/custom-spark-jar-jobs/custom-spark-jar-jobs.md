---
title: "Custom Spark JAR Jobs | Cloud"
slug: /custom-spark-jar-jobs
sidebar_label: "Custom Spark JAR Jobs"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Custom Spark JAR jobs let you run your own Spark application when the built-in jobs do not cover your processing needs. Use them to apply business-specific transformations, custom algorithms, or validation rules while Zilliz Cloud manages the Spark runtime, execution, monitoring, and cancellation. | Cloud"
type: origin
token: M3L7wIGgCiC7URkvruEcGS4RnGd
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Custom Spark JAR Jobs

Custom Spark JAR jobs let you run your own Spark application when the built-in jobs do not cover your processing needs. Use them to apply business-specific transformations, custom algorithms, or validation rules while Zilliz Cloud manages the Spark runtime, execution, monitoring, and cancellation.

## Before you start\{#before-you-start}

Before creating a custom Spark JAR job:

- Prepare a Java or Scala application packaged as a single JAR compatible with the Zilliz Cloud Spark runtime.

- Upload the JAR to a Zilliz Cloud Volume.

- Make sure the data your application needs to read or write is available in Zilliz Cloud Volumes.

For runtime versions and dependency packaging requirements, see [Prepare a Compatible Spark JAR](./prepare-a-compatible-spark-jar).

## Create a custom JAR job\{#create-a-custom-jar-job}

To create a custom JAR job, upload your application JAR to a Zilliz Cloud Volume, prepare the job request with the JAR location, main class, application arguments, and any required data or runtime settings, and then submit the request to Zilliz Cloud.

&lt;Procedure&gt;

1. Prepare an idempotency key.

    An idempotency key is a unique string that remains unchanged when retrying the same job request. For details, refer to [Idempotent submission](./primary-key-dedup).

1. Prepare the request payload.

    ```bash
    export payload='{
      "jobName": "jar-demo",
      "projectId": "proj-xxx",
      "regionId": "aws-us-west-2",
      "artifact": {
        "volumeId": "volume-artifact",
        "path": "jobs/my-spark-job.jar"
      },
      "mainClass": "com.example.batch.Main",
      "input": {
        "type": "volume",
        "volumeId": "volume-data",
        "path": "input/raw.parquet",
        "format": "parquet"
      },
      "output": {
        "type": "volume",
        "volumeId": "volume-data",
        "path": "output/result.parquet",
        "format": "parquet",
        "writeMode": "ERROR_IF_EXISTS"
      },
      "arguments": [
        "--input",
        "${input.uri}",
        "--output",
        "${output.uri}",
        "--partition",
        "${job.parameters.partition}"
      ],
      "jobParameters": {
        "partition": "2026-07-30"
      },
      "clusterSize": "SMALL",
      "minExecutors": 1,
      "maxExecutors": 4,
      "timeoutSeconds": 3600,
      "sparkConf": {
        "spark.sql.shuffle.partitions": "64",
        "spark.sql.adaptive.enabled": "true"
      }
    }'
    ```

    The request identifies the JAR to run, the application entry point, the data paths available to the job, and optional runtime settings. For custom JAR jobs, pay particular attention to the following fields:

    | Field | Description |
    | --- | --- |
    | `artifact` | Identifies the JAR stored in a Zilliz Cloud Volume. Specify the Volume ID (`volumeId`) and the JAR's relative path (`path`) separately. |
    | `mainClass` | The fully qualified class name that starts the application. |
    | `arguments` | An ordered list of strings passed to the application's main class. |
    | `jobParameters` | Defines reusable string values that can be referenced from `arguments`. |
    | `input` / `output` | Declares Volume paths that the job can access and makes corresponding placeholders available in `arguments`. |
    | `sparkConf` | Applies supported Spark configuration overrides for the job. |

    In the example, `${input.uri}` and `${output.uri}` are resolved when the job is created, while `${job.parameters.partition}` is replaced with the value defined in `jobParameters`.

1. Submit the payload.

    ```bash
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    
    curl --request POST \
        --url "https://api.cloud.zilliz.com/v2/jobs/jar" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "Idempotency-Key: spark-job-20260730-001" \
        --header "Content-Type: application/json" \
        --data "${payload}"
    ```



### Pass data and parameters to your application\{#pass-data-and-parameters-to-your-application}

Use `arguments` to pass values to your application's main class. You can pass literal strings, reference declared input or output paths, or inject reusable values from `jobParameters`.

For example:

```json
"arguments": [
  "--input",
  "${input.uri}",
  "--output",
  "${output.uri}",
  "--partition",
  "${job.parameters.partition}"
],
"jobParameters": {
  "partition": "2026-07-30"
}
```

`${input.uri}` and `${output.uri}` resolve to the Volume paths declared by the job, and `${job.parameters.<key>}` resolves to the corresponding value in `jobParameters`. Placeholders are resolved when the job is created. If a referenced value does not exist, the request fails validation.

Custom JAR jobs access data through Zilliz Cloud Volumes, which provide managed access to your connected object storage. You can also pass a `volume://` URI directly in `arguments`.

For the complete list of supported placeholders and their resolved values, see the Custom JAR job API reference.

### Access Volume data in your application\{#access-volume-data-in-your-application}

Volume paths passed to your application use the `volume://` URI scheme. In the managed Spark environment, Zilliz Cloud resolves these URIs through the Hadoop FileSystem, so you can use standard Spark or Hadoop APIs to read and write data.

For example:

```java
String input = args[1];
String output = args[3];

Dataset<Row> df = spark.read().parquet(input);
df.write().mode("errorifexists").parquet(output);
```

Use Spark or Hadoop APIs when accessing `volume://` paths. Local filesystem APIs such as `java.io.File` or `java.nio.file` cannot be used to access Volume data.

The job can access only the Volume paths explicitly declared or referenced in the job request. It does not automatically receive access to other Volumes in the project.

### Configure Spark settings\{#configure-spark-settings}

Use `sparkConf` to adjust supported Spark settings for a custom JAR job. Zilliz Cloud currently supports the following configurations:

| **Configuration Item** | **Description** |
| --- | --- |
| `spark.sql.shuffle.partitions` | Sets the number of partitions used for Spark SQL shuffle operations. |
| `spark.sql.adaptive.enabled` | Enables or disables Adaptive Query Execution (AQE). |
| `spark.sql.adaptive.coalescePartitions.enabled` | Enables or disables adaptive partition coalescing. |

Only supported keys can be set through `sparkConf`. Driver and executor settings, Kubernetes settings, Hadoop credentials, dependency loading, dynamic allocation, and other platform-managed configurations cannot be overridden.

To adjust job resources, use `clusterSize`, `minExecutors`, and `maxExecutors` instead of Spark configuration keys.

## Monitor the job\{#monitor-the-job}

After submitting the request, use the returned job ID to monitor the job until it reaches a terminal state. You can view the job status and details, list existing jobs, or cancel the job while it is still in a cancelable state.

When the job succeeds, verify that the expected output is available at the path specified in the request.

For instructions, job states, and state transitions, see [Manage Spark Batch Jobs](./manage-spark-batch-jobs).

## Understand the output\{#understand-the-output}

Custom JAR jobs return an `outputContract` that describes the output properties Zilliz Cloud can determine from the job request. Because the transformation logic is defined by your application, Zilliz Cloud cannot infer the exact output schema or column-level changes.

For example:

```json
{
  "operator": "jar",
  "outputFormat": "parquet",
  "writeMode": "ERROR_IF_EXISTS",
  "preservesInputColumns": null,
  "generatedColumns": []
}
```

The contract includes the output format and write mode declared for the job. For custom JAR jobs, `preservesInputColumns` is always `null` and `generatedColumns` is always empty because Zilliz Cloud cannot inspect how your application transforms the data. These values indicate that the column-level behavior is unknown to the platform; they do not mean that input columns are removed or that no new columns are generated.

### Output write mode\{#output-write-mode}

The `writeMode` setting controls how Zilliz Cloud handles the output path:

- `ERROR_IF_EXISTS` checks that the output path does not already exist and reserves the path before the job runs, preventing conflicting jobs from writing to the same location.

- `OVERWRITE` allows the job to write to an existing output path.

For custom JAR jobs, Zilliz Cloud does not override the Spark write mode implemented inside your application. Configure your application to use the corresponding Spark mode:

| **writeMode** | **Spark write mode** |
| --- | --- |
| `ERROR_IF_EXISTS` | mode("errorifexists") |
| `OVERWRITE` | mode("overwrite") |

Keep the two settings consistent. Otherwise, the platform may allow the job to start, but the application may later fail or behave differently when writing the output.

Because the output schema and transformations are defined by your JAR, validate the resulting data according to your application logic after the job succeeds.

## Next steps\{#next-steps}

To build a JAR that is compatible with the managed Spark runtime, see [Prepare a Compatible Spark JAR](./prepare-a-compatible-spark-jar). To view job details, track job states, or cancel running jobs, see [Manage Spark Batch Jobs](./manage-spark-batch-jobs).

import DocCardList from '@theme/DocCardList';

<DocCardList />