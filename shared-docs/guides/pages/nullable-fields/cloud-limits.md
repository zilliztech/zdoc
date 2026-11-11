## Limits

- Vector fields that allow NULL values do not support `IS NULL` or `IS NOT NULL` filter expressions. You cannot explicitly filter entities based on whether a vector field value is NULL.

- On Zilliz Cloud, nullable StructArray fields are supported on both Free/Serverless and Dedicated Clusters. Set `nullable=True` on the parent StructArray field, not on individual subfields. NULL applies to the whole StructArray field, not to an individual Struct element, and the parent setting is propagated to its subfields internally. A StructArray field added to an existing collection must be nullable so existing entities can return NULL for the new field. Element-level null values are supported on Dedicated Clusters but not yet available on Free/Serverless Clusters. For details, refer to [StructArray Limits](structarray-limits.md#Nullable-and-dynamic-schema-limits).

- The `nullable` attribute is defined when a field is created and cannot be modified afterward. You cannot enable or disable nullability for an existing field.

- Fields marked as nullable cannot be used as partition keys. Partition key fields must always contain valid, non-null values. For more information, refer to [Use Partition Key](use-partition-key.md).
