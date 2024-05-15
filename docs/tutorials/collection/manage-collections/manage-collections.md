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

<table>
   <tr>
     <th><strong>Cluster Type</strong></th>
     <th><strong>Max Number</strong></th>
     <th><strong>Remarks</strong></th>
   </tr>
   <tr>
     <td>Free cluster</td>
     <td>2<br/></td>
     <td>You can create up to 2 collections.</td>
   </tr>
   <tr>
     <td>Serverless cluster</td>
     <td>10<br/></td>
     <td>You can create up to 10 collections.</td>
   </tr>
   <tr>
     <td>Dedicated cluster<br/></td>
     <td>64 per CU, and \&lt;= 4096</td>
     <td>You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster.</td>
   </tr>
</table>

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

<table>
   <tr>
     <th><strong>Number of CUs</strong></th>
     <th><strong>General Capacity</strong></th>
   </tr>
   <tr>
     <td>1-8 CUs</td>
     <td>\&lt;= 4,096</td>
   </tr>
   <tr>
     <td>12+ CUs</td>
     <td>Min(512 x Number of CUs, 65536)</td>
   </tr>
</table>

For details on the calculation of general and consumed capacity, refer to [Zilliz Cloud Limits](./limits#collections).

## Contents{#contents}

In this chapter, you will find out how to manage your collections on the Console or through the SDKs.

import DocCardList from '@theme/DocCardList';

<DocCardList />