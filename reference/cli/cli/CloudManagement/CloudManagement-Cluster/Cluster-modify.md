---
title: "modify | Cloud"
slug: /cli/cli/Cluster-modify
sidebar_label: "modify"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation modifies a cluster configuration, such as scaling the number of allocated CUs or the number of replicas to create. | Cloud"
type: docx
token: AYlXdnqMKoQOzRxSbWScn0A5nqf
sidebar_position: 6
keywords: 
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - zilliz
  - zilliz cloud
  - cloud
  - modify
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# modify

This operation modifies a cluster configuration, such as scaling the number of allocated CUs or the number of replicas to create.

## Description\{#description}

You can change the CU size and number of replicas of the specified cluster using this command. This command applies only to Dedicated clusters.

Running

## Synopsis\{#synopsis}

```bash
zilliz cluster modify
--cluster-id <value>
[--cu-size <value>]
[--replica <value>]
[--output <value>]
[--query <value>]
[--no-header]
[--body <value>]
```

## Options\{#options}

- **--cluster-id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the cluster to modify.

    If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--cu-size** (*integer*) -

    Indicates the number of compute units (CUs) after this operation.

    A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to **Dedicated** clusters.

    - For a **Dedicated** cluster in a **Standard** project, the product of its CU size and the number of replicas must be less than or equal to 32.

    - For a **Dedicated** cluster in an **Enterprise** project, the product of its CU size and the number of replicas must be less than or equal to 1,024.

- **--replica** (*integer*) -

    Indicates the number of replicas after this operation.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`,

    - `yaml`,

    - `csv`.

- **--no-header** (*boolean*) -

    Indicates whether to omit the header row when output is set to `table` or `csv`.

- **--query, -q** (*string*) -

    Indicates a JMESPath expression to filter output.

- **--body** (*string*) -

    Indicates the JSON payload that match the following schema. For concrete examples, refer to [Modify Cluster](/reference/restful/modify-cluster-v2).

    ```json
    {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "title": "modify cluster",
        "type": "object",
        "properties": {
            "cuSize": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            },
            "replica": {
                "type": "integer",
                "minimum": 1,
                "maximum": 1024
            }
        },
        "required": [
            "cuSize"
        ]
    }
    ```

## Example\{#example}

```bash
# Scale to 2 CUs
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --cu-size 2

# Set replicas
zilliz cluster modify --cluster-id in01-xxxxxxxxxxxx --replica 2
```
