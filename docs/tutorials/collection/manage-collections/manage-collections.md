---
slug: /manage-collections
beta: FALSE
notebook: FALSE
type: origin
token: XzguwvYt9ipFpkkNdNzcgMnOnJe
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Manage Collections

Learn about how to manipulate collections on the Zilliz Cloud console or via SDKs.

## Limits on collections{#limits-on-collections}

|  __Cluster Type__                                    |  __Max Number__                              |  __Remarks__                                                                                                               |
| ---------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|  Serverless cluster |  2<br/>  |  You can create up to 2 serverless collections.                                           |
|  Dedicated cluster<br/>                           |  64 per CU, and <= 4096                      |  You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster. |

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

|  __Number of CUs__ |  __General Capacity__            |
| ------------------ | -------------------------------- |
|  1-8 CUs           |  <= 4,096                        |
|  12+ CUs           |  Min(512 x Number of CUs, 65536) |

For details on the calculation of general and consumed capacity, refer to [Zilliz Cloud Limits](./limits#collections).

## Contents{#contents}

import DocCardList from '@theme/DocCardList';

<DocCardList />