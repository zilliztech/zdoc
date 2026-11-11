| Limit | Details |
| --- | --- |
| Source file formats | JSON, JSONL, CSV, and Parquet files can carry StructArray fields. NumPy files hold one file per top-level field and cannot provide StructArray data; use JSON, CSV, or Parquet files for collections that have a StructArray field. For file shapes, see [Prepare Source Data](prepare-source-data.md#StructArray-fields-in-source-files). |
| Backup and snapshot import | Binlog import, such as a backup restore, and snapshot-source import are rejected for collections that have element-nullable subfields or scalar `ARRAY` subfields. |
