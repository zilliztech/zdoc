| Limit | Details |
| --- | --- |
| Source file formats | JSON, JSONL, CSV, and Parquet files can carry StructArray fields. NumPy files hold one file per top-level field and cannot provide StructArray data; use JSON, CSV, or Parquet files for collections that have a StructArray field. For file shapes, see [Prepare Source Data](prepare-source-data.md#StructArray-fields-in-source-files). |
| Backup and snapshot import | Binlog import, such as a backup restore, and snapshot-source import are rejected for collections that have element-nullable subfields or scalar `ARRAY` subfields. |

## StructArray features across cluster types

The following table compares the StructArray field operations supported by external collections and managed collections in detail.

<table>
   <tr>
     <th rowspan="2"><p><strong>Feature</strong></p></th>
     <th rowspan="2"><p><strong>Dedicated Cluster</strong></p><p><strong>Managed Collection</strong></p></th>
     <th colspan="2"><p><strong>On-Demand Cluster</strong></p></th>
   </tr>
   <tr>
     <th><p><strong>Managed Collection</strong></p></th>
     <th><p><strong>External Collection</strong></p></th>
   </tr>
   <tr>
     <td><p>Create a collection with StructArray fields</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Insert, upsert, or partial update</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Bulk import with StructArray</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Element-level search (range, grouping, hybrid, and so on)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><code>ELEMENT_FILTER</code> and the <code>MATCH_*</code> family</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>EmbeddingList search (<code>MAX_SIM</code> metrics)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Add a whole StructArray field (must be nullable)</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop a whole StructArray field</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Nullable subfields (<code>element_nullable</code>, such as a nullable vector)</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Add a subfield to an existing StructArray</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Drop a subfield</p></td>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>
