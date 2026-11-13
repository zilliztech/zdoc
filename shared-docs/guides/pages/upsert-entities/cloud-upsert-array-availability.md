For `ARRAY` fields, merge mode supports two operators: `ARRAY_APPEND` and `ARRAY_REMOVE`. These operators let you append elements to or remove matching elements from an existing `ARRAY` field, without first querying the entity to retrieve its current value. For details, see [Upsert ARRAY fields in merge mode](upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode--Milvus-2617).

### Update field values

To update the field values of an existing entity, use [upsert in merge mode](upsert-entities.md#Upsert-entities-in-merge-mode). In this mode, only the fields included in the request are updated; all other fields retain their existing values.
