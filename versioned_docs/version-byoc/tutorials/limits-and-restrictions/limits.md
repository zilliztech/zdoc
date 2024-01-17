---
slug: /limits
beta: FALSE
notebook: FALSE
token: YBuLw6cgiiHaXxk88Kbc6uzynFf
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Limits

This page lists some known limitations that users may encounter when using Zilliz Cloud.

## Limits on the UI{#limits-on-the-ui}

This is a list of limitations on the UI.

### Account password{#account-password}

- A string of 8 to 128 characters

- Must contain uppercase letters, lowercase letters, numbers, and special characters, such as `~`, `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `?`, `_`, and `-`.

### Cluster access password{#cluster-access-password}

- A string of 8 to 64 characters

- Must contain uppercase letters, lowercase letters, numbers, and special characters, such as `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`, `_`, `+`, `-` and `=`.

### Project name{#project-name}

- A string of 1 to 64 characters

- Must contain uppercase letters, lowercase letters, numbers, and special characters, such as `~`, `!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `?`, `_`, and `-`.

### Cluster name{#cluster-name}

- A string of 2 to 32 characters, starting with a letter and ending with a letter or digit

- Must contain uppercase letters, lowercase letters, numbers, and special characters`-`

- Must differ from those of other clusters

## Limits on clusters{#limits-on-clusters}

This is a list of limitations on the UI.

### Resource names{#resource-names}

|  **Resource Type** |  **Length (Characters)** |
| ------------------ | ------------------------ |
|  **Collection**    |  255                     |
|  **Field**         |  255                     |
|  **Index**         |  255                     |
|  **Partition**     |  255                     |

### Naming conventions{#naming-conventions}

The name of a resource can contain numbers, letters, dollar signs ($), and underscores (_). A resource name must start with a letter or an underscore (_).

### Collections{#collections}

|  **Resource Type**                 |  **Length (Characters)** |
| ---------------------------------- | ------------------------ |
|  **Max. Collections (1-8 CUs)**    |  32                      |
|  **Max. Collections (over 8 CUs)** |  256                     |
|  **Max. Connections / Proxy**      |  65535                   |

### Data types{#data-types}

|  **Data type**    |  **Primary Key** |  **Availability** |  **Attributes**          |
| ----------------- | ---------------- | ----------------- | ------------------------ |
|  **BOOL**         |  No              |  Yes              |  N/A                     |
|  **INT8**         |  No              |  Yes              |  N/A                     |
|  **INT16**        |  No              |  Yes              |  N/A                     |
|  **INT32**        |  No              |  Yes              |  N/A                     |
|  **INT64**        |  Yes             |  Yes              |  N/A                     |
|  **FLOAT**        |  No              |  Yes              |  N/A                     |
|  **DOUBLE**       |  No              |  Yes              |  N/A                     |
|  **VARCHAR**      |  Yes             |  Yes              |  65,535 (Max length)     |
|  **JSON**         |  No              |  Yes              |  N/A                     |
|  **FLOAT_VECTOR** |  No              |  Yes              |  32,768 (Max dimensions) |

### Index types{#index-types}

Currently, **AUTOINDEX** is the only index type that databases on Zilliz Cloud support. It is a proprietary index type for index auto-optimization and offers extremely high performance. For details, refer to [AUTOINDEX Explained](./autoindex-explained).

### Number of resources in a collection{#number-of-resources-in-a-collection}

This table lists the maximum number of corresponding resources per collection. Currently, you can only create one vector field in each collection. However, you can index both the vector field and scalar fields. For details, refer to [Manage Index](./manage-index).

|            |  **Shards** |  **Total Fields** |  **Vector Fields** |
| ---------- | ----------- | ----------------- | ------------------ |
|  **1 CU**  |  2          |  64               |  1                 |
|  **2 CU**  |  2          |  64               |  1                 |
|  **4 CU**  |  3          |  64               |  1                 |
|  **8 CU**  |  8          |  64               |  1                 |
|  **12 CU** |  12         |  64               |  1                 |
|  **16 CU** |  16         |  64               |  1                 |
|  **20 CU** |  20         |  64               |  1                 |
|  **24 CU** |  24         |  64               |  1                 |
|  **28 CU** |  28         |  64               |  1                 |
|  **32 CU** |  32         |  64               |  1                 |

### Quota and limits{#quota-and-limits}

|            |  **Insert** |  **Search** |  **Query** |  **Delete** |
| ---------- | ----------- | ----------- | ---------- | ----------- |
|  **1 CU**  |  4 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **2 CU**  |  4 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **4 CU**  |  6 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **8 CU**  |  6 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **12 CU** |  8 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **16 CU** |  8 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **20 CU** |  8 MB/s     |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **24 CU** |  12 MB/s    |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **28 CU** |  12 MB/s    |  1 req/s    |  1 req/s   |  0.5 MB/s   |
|  **32 CU** |  12 MB/s    |  1 req/s    |  1 req/s   |  0.5 MB/s   |

### Search parameters{#search-parameters}

|  **Vectors**                                             |  **Recommended Value** |
| -------------------------------------------------------- | ---------------------- |
|  `topK` (number of the most similar results to return)** |  10,000                |
|  `nq` (number of the search request)**                   |  10,000                |