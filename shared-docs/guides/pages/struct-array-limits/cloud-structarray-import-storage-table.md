| Limit | Details |
| --- | --- |
| Source file formats | JSON, JSONL, CSV, and Parquet files can carry StructArray fields. NumPy files hold one file per top-level field and cannot provide StructArray data; use JSON, CSV, or Parquet files for collections that have a StructArray field. For file shapes, see [Prepare Source Data](prepare-source-data.md#StructArray-fields-in-source-files). |
| Backup and snapshot import | Binlog import, such as a backup restore, and snapshot-source import are rejected for collections that have element-nullable subfields or scalar `ARRAY` subfields. |

## StructArray features across cluster types

The following table compares the StructArray field operations supported by external collections and managed collections in detail.

| Feature | Dedicated Cluster, managed collections | On-Demand Cluster, managed collections | On-Demand Cluster, external collections |
| --- | --- | --- | --- |
| Create a collection with StructArray fields | ✅ | ✅ | ❌ |
| Insert, upsert, or partial update | ✅ | ❌ | ❌ |
| Bulk import with StructArray | ✅ | ✅ | ❌ |
| Element-level search (range, grouping, hybrid, and so on) | ✅ | ✅ | ❌ |
| `ELEMENT_FILTER` and the `MATCH_*` family | ✅ | ✅ | ❌ |
| EmbeddingList search (`MAX_SIM` metrics) | ✅ | ✅ | ❌ |
| Add a whole StructArray field (must be nullable) | ✅ | ✅ | ❌ |
| Drop a whole StructArray field | ✅ | ✅ | ❌ |
| Nullable subfields (`element_nullable`, such as a nullable vector) | ✅ | ❌ | ❌ |
| Add a subfield to an existing StructArray | ✅ | ❌ | ❌ |
| Drop a subfield | ✅ | ❌ | ❌ |
