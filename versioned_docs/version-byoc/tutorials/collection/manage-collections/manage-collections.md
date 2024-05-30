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
     <th><p><strong>Cluster Type</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p></p></td>
     <td><p><br/></p></td>
     <td><p></p></td>
   </tr>
   <tr>
     <td><p></p></td>
     <td><p><br/></p></td>
     <td><p></p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster<br/></p></td>
     <td><p>64 per CU, and \&lt;= 4096</p></td>
     <td><p>You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster.</p></td>
   </tr>
</table>

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

<table>
   <tr>
     <th><p><strong>Number of CUs</strong></p></th>
     <th><p><strong>General Capacity</strong></p></th>
   </tr>
   <tr>
     <td><p>1-8 CUs</p></td>
     <td><p>\&lt;= 4,096</p></td>
   </tr>
   <tr>
     <td><p>12+ CUs</p></td>
     <td><p>Min(512 x Number of CUs, 65536)</p></td>
   </tr>
</table>

For details on the calculation of general and consumed capacity, refer to [Zilliz Cloud Limits](./limits#collections).

## Contents{#contents}

In this chapter, you will find out how to manage your collections on the Console or through the SDKs.

import DocCardList from '@theme/DocCardList';

<DocCardList />