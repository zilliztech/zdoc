---
title: "Prepare a Compatible Spark JAR | Cloud"
slug: /prepare-a-compatible-spark-jar
sidebar_label: "Prepare a Compatible Spark JAR"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Build your Spark application to match the Zilliz Cloud managed runtime. This guide covers the runtime versions, dependency packaging, and application code requirements needed to produce a compatible JAR. | Cloud"
type: origin
token: HtOmwWLISiB2zokBdjXcDtlTn6g
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Prepare a Compatible Spark JAR

Build your Spark application to match the Zilliz Cloud managed runtime. This guide covers the runtime versions, dependency packaging, and application code requirements needed to produce a compatible JAR.

## Use compatible runtime versions\{#use-compatible-runtime-versions}

Build your application against versions that are compatible with the Zilliz Cloud managed Spark runtime.

| Component | Requirement |
| --- | --- |
| Java | JDK 21 is recommended. The generated class target must not exceed Java 21. |
| Scala | Use Scala 2.13. Scala 2.13.16 is recommended to match the managed runtime. |
| Spark | Use Spark 4.0.1 artifacts built for Scala 2.13. |

Java and Scala applications are both submitted as JVM JARs, and you do not need to specify the application language when creating the job. Python applications are not supported.

## Package dependencies\{#package-dependencies}

Zilliz Cloud provides the core Spark runtime dependencies, including Spark, Scala, and Hadoop. Declare these dependencies as `provided` when building your application instead of packaging them into the JAR.

Package your application code and any third-party dependencies that are not provided by the managed runtime into a single fat or uber JAR. Custom JAR jobs currently accept only one JAR artifact and do not support resolving additional dependencies at runtime through `spark.jars.packages`, Maven coordinates, or extra dependency JARs.

For libraries that commonly conflict with runtime dependencies, such as Jackson, Guava, or Netty, consider using shade relocation to isolate their package names and reduce classpath conflicts.

## Write compatible application code\{#write-compatible-application-code}

Use the Spark runtime provided by Zilliz Cloud rather than creating a separate Spark environment. Obtain the active Spark session with `SparkSession.builder().getOrCreate()` and use standard Spark APIs in your application.

<Tabs>

<TabItem label="Java" value="java" default>

```java
import org.apache.spark.sql.SparkSession;

public class Main {
    public static void main(String[] args) {
        SparkSession spark = SparkSession.builder()
            .getOrCreate();

        try {
            run(spark, args);
        } finally {
            spark.stop();
        }
    }

    private static void run(SparkSession spark, String[] args) {
        // Application logic
    }
}
```

</TabItem>

<TabItem label="Scala" value="scala">

```scala
import org.apache.spark.sql.SparkSession

object Main {
  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .getOrCreate()

    try {
      run(spark, args)
    } finally {
      spark.stop()
    }
  }

  def run(spark: SparkSession, args: Array[String]): Unit = {
    // Application logic
  }
}
```

</TabItem>

</Tabs>

For cleanup that must run reliably, use `try-finally` rather than relying on JVM shutdown hooks. Custom JAR jobs can use the standard Spark 4.0.1 APIs available in the managed runtime.

## Build the JAR\{#build-the-jar}

Build your application as a single deployable JAR that includes your application code and all third-party dependencies not provided by the managed runtime. Keep Spark, Scala, and Hadoop dependencies in `provided` scope so they are not bundled into the final artifact.

For Java applications, you can use Maven or Gradle to produce a fat or uber JAR. For Scala applications, use a tool such as `sbt-assembly` to package application dependencies into a single JAR.

After building the application, verify that the resulting artifact:

- Is a single `.jar` file.

- Contains the configured main class.

- Does not bundle Spark, Scala, or Hadoop runtime libraries.

- Includes all other dependencies required by your application.

If your dependency tree includes libraries that may conflict with the managed runtime, such as Jackson, Guava, or Netty, use shade relocation where appropriate before submitting the JAR.

## Verify the JAR\{#verify-the-jar}

Before using the JAR in a custom Spark job, verify that:

- The artifact is a single `.jar` file.

- The JAR contains the main class that you plan to specify in the job request.

- The generated Java class target does not exceed Java 21.

- Scala applications use Scala 2.13 and Spark 4.0.1 `_2.13` artifacts.

- Spark, Scala, and Hadoop dependencies are not bundled into the JAR.

- All other dependencies required by your application are included.

- Any dependency conflicts that require shading or relocation have been addressed.

## Next steps\{#next-steps}

After the JAR is ready, see [Custom Spark JAR Jobs](./custom-spark-jar-jobs) for how to upload the artifact to a Zilliz Cloud Volume and submit it for execution.