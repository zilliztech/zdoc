- **Upsert an** `ARRAY` **field.**

    By default, an `ARRAY` field in merge mode follows **REPLACE** semantics: the value carried in the request overwrites the existing array. For finer-grained updates, Zilliz Cloud also supports two operators:

    - `ARRAY_APPEND` appends the elements in the request payload to the existing array.

    - `ARRAY_REMOVE` removes every element from the existing array that matches a value in the request payload.

    For operator syntax, supported element types, and other constraints, see [Upsert ARRAY fields in merge mode](upsert-entities.md#Upsert-ARRAY-fields-in-merge-mode--Milvus-2617).
