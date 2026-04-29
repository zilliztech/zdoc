---
title: "Storage Request Cost | Cloud"
slug: /storage-request-cost
sidebar_key: storage-request-cost
sidebar_label: "Storage Request"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Storage request cost covers the object storage API request operations used by your workloads. | Cloud"
type: origin
token: YMYFwJhUuibUTxkJ1lTcNVSxnhg
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cost
  - billing

---

import Admonition from '@theme/Admonition';


# Storage Request Cost

Storage request cost covers the object storage API request operations used by your workloads.

## Sources of storage request cost\{#sources-of-storage-request-cost}

You incur storage request costs when your workload performs billable object-storage API operations. 

Requests are grouped into two classes:    

- **Class 1**: `PUT`, `COPY`, `POST`, `LIST`

- **Class 2**: `GET`, `SELECT`

The following operations incur storage request costs on Zilliz Cloud:

- Build indexes on a managed collection in an on-demand compute database. This incurs both Class 1 and Class 2 request costs.

- Run search on a managed collection in an on-demand compute database when only indexes are loaded. This incurs Class 2 request costs.

- Run search on a tiered-storage serving cluster when cold data is read from object storage. This incurs Class 2 request costs.

The following operations do not incur storage request costs:

- All operations on external collections.

- Import data from object storage into an on-demand compute database.

- Build index/search on performance-optimized or capacity-optimized serving clusters.

### Cost calculation\{#cost-calculation}

```plaintext
Storage Requests Cost = (Class 1 Request Count x Class 1 Unit Price)
                      + (Class 2 Request Count x Class 2 Unit Price)
```

- **Class 1 Request Count**: Number of Class 1 requests.

- **Class 2 Request Count**: Number of Class 2 requests.

- **Unit Price**: Determined by the cloud region and request class. For details, see [Zilliz Cloud Pricing](https://zilliz.com/pricing/pricing-guide).

## Example\{#example}

Suppose your usage in one billing interval is as follows:

- **Region**: AWS us-east-1

- **Class 1 Request Count**: 200,000

- **Class 2 Request Count**: 1,200,000

The unit prices are:

- **Class 1 Unit Price** = &#36;5.00 per 1M requests

- **Class 2 Unit Price** = &#36;0.4 per 1M requests

Then, the total storage request cost is `(0.2 x 5.00) + (1.2 x 0.40) = $1.48`.