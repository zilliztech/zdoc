- The subfield can be a scalar, a vector, or a scalar array. Zilliz Cloud appends it after the existing subfields.

- You cannot bind an index while adding the subfield. Create the index with a separate `create_index()` call. An added vector subfield supports element-level metrics only, and the collection must have an index on it before you load the collection with the new subfield included.

- Clients that omit the new subfield when inserting keep working, because Zilliz Cloud stores null for omitted element-nullable subfields.
